import json
import os
import pickle
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder

from backend.database.session import SessionLocal
from backend.models.product import Product
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem

FESTIVAL_CSV = "datasets/raw/festivals/festival_calendar.csv"
WEATHER_CSV = "datasets/raw/weather/weatherHistory.csv"

MODEL_DIR = Path("models/forecast")
MODEL_PATH = MODEL_DIR / "xgboost.pkl"
ENCODER_PATH = MODEL_DIR / "label_encoder.pkl"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.json"
METRICS_PATH = MODEL_DIR / "metrics.json"
FEATURE_IMPORTANCE_PATH = MODEL_DIR / "feature_importance.csv"

VALIDATION_DAYS = 60
RANDOM_STATE = 42


def ensure_output_dir() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)


def load_festival_month_days() -> set[tuple[int, int]]:
    festival_month_days: set[tuple[int, int]] = set()
    if not os.path.exists(FESTIVAL_CSV):
        return festival_month_days

    with open(FESTIVAL_CSV, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            raw_date = line.split(",")[0].replace("--", "-")
            try:
                d = datetime.strptime(raw_date, "%Y-%m-%d").date()
                festival_month_days.add((d.month, d.day))
            except ValueError:
                continue

    return festival_month_days


def load_climatological_temp_by_day_of_year() -> dict[int, float]:
    if not os.path.exists(WEATHER_CSV):
        return {}

    df = pd.read_csv(WEATHER_CSV, usecols=["Formatted Date", "Temperature (C)"])
    df["Formatted Date"] = pd.to_datetime(
        df["Formatted Date"],
        utc=True,
        errors="coerce",
    )
    df = df.dropna(subset=["Formatted Date"])
    df["day_of_year"] = df["Formatted Date"].dt.dayofyear
    return df.groupby("day_of_year")["Temperature (C)"].mean().to_dict()


def load_daily_sales_df() -> pd.DataFrame:
    db = SessionLocal()
    try:
        rows = (
            db.query(
                Sale.created_at,
                SaleItem.product_id,
                SaleItem.quantity,
            )
            .join(SaleItem, SaleItem.sale_id == Sale.id)
            .order_by(Sale.created_at.asc())
            .all()
        )

        product_rows = db.query(Product.id, Product.category).all()
        products = {p.id: p.category for p in product_rows}
    finally:
        db.close()

    df = pd.DataFrame(rows, columns=["date", "product_id", "quantity"])
    if df.empty:
        return df

    df["date"] = pd.to_datetime(df["date"], utc=True, errors="coerce")
    df = df.dropna(subset=["date"])
    df["date"] = df["date"].dt.tz_convert(None).dt.normalize()
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce").fillna(0.0)

    daily = (
        df.groupby(["product_id", "date"], as_index=False)["quantity"]
        .sum()
        .sort_values(["product_id", "date"])
        .reset_index(drop=True)
    )
    daily["category"] = daily["product_id"].map(products).fillna("UNCATEGORIZED")
    return daily


def build_feature_columns() -> list[str]:
    return [
        "product_id",
        "category_encoded",
        "day_of_week",
        "day_of_month",
        "week_of_year",
        "month",
        "quarter",
        "is_weekend",
        "is_month_start",
        "is_month_end",
        "is_festival",
        "temp_proxy",
        "temp_proxy_7d_avg",
        "temperature_trend",
        "lag_1",
        "lag_3",
        "lag_7",
        "lag_14",
        "rolling_mean_3",
        "rolling_mean_7",
        "rolling_mean_14",
        "rolling_std_7",
        "rolling_std_14",
        "rolling_max_7",
        "rolling_min_7",
        "growth_rate",
        "pct_change_7",
        "recent_trend_7",
        "month_sin",
        "month_cos",
        "dow_sin",
        "dow_cos",
    ]


def safe_mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    mask = y_true != 0
    if not np.any(mask):
        return 0.0
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100.0)


def build_product_features(
    product_df: pd.DataFrame,
    product_id: int,
    category: str,
    festival_month_days: set[tuple[int, int]],
    temp_by_doy: dict[int, float],
) -> pd.DataFrame:
    if product_df.empty:
        return pd.DataFrame()

    product_df = product_df.copy()
    product_df["date"] = pd.to_datetime(product_df["date"], errors="coerce")
    product_df = product_df.dropna(subset=["date"])

    if product_df.empty:
        return pd.DataFrame()

    product_df = product_df.sort_values("date").reset_index(drop=True)

    full_range = pd.date_range(
        product_df["date"].min(),
        product_df["date"].max(),
        freq="D",
    )

    product_df = (
        product_df.set_index("date")
        .reindex(full_range)
        .rename_axis("date")
        .reset_index()
    )

    product_df["product_id"] = product_id
    product_df["category"] = category
    product_df["quantity"] = pd.to_numeric(product_df["quantity"], errors="coerce").fillna(0.0)

    overall_avg_temp = (
        float(sum(temp_by_doy.values()) / len(temp_by_doy))
        if temp_by_doy
        else 25.0
    )

    product_df["day_of_week"] = product_df["date"].dt.dayofweek
    product_df["day_of_month"] = product_df["date"].dt.day
    product_df["week_of_year"] = product_df["date"].dt.isocalendar().week.astype(int)
    product_df["month"] = product_df["date"].dt.month
    product_df["quarter"] = product_df["date"].dt.quarter
    product_df["is_weekend"] = (product_df["day_of_week"] >= 5).astype(int)
    product_df["is_month_start"] = product_df["date"].dt.is_month_start.astype(int)
    product_df["is_month_end"] = product_df["date"].dt.is_month_end.astype(int)
    product_df["day_of_year"] = product_df["date"].dt.dayofyear

    product_df["is_festival"] = product_df["date"].apply(
        lambda d: int((d.month, d.day) in festival_month_days)
    )
    product_df["temp_proxy"] = (
        product_df["day_of_year"].map(temp_by_doy).fillna(overall_avg_temp)
    )
    product_df["temp_proxy_7d_avg"] = product_df["temp_proxy"].rolling(
        7,
        min_periods=1,
    ).mean()
    product_df["temperature_trend"] = product_df["temp_proxy"].diff().fillna(0.0)

    s = product_df["quantity"].astype(float)

    product_df["lag_1"] = s.shift(1)
    product_df["lag_3"] = s.shift(3)
    product_df["lag_7"] = s.shift(7)
    product_df["lag_14"] = s.shift(14)

    shifted = s.shift(1)
    product_df["rolling_mean_3"] = shifted.rolling(3).mean()
    product_df["rolling_mean_7"] = shifted.rolling(7).mean()
    product_df["rolling_mean_14"] = shifted.rolling(14).mean()
    product_df["rolling_std_7"] = shifted.rolling(7).std()
    product_df["rolling_std_14"] = shifted.rolling(14).std()
    product_df["rolling_max_7"] = shifted.rolling(7).max()
    product_df["rolling_min_7"] = shifted.rolling(7).min()

    lag_7_safe = product_df["lag_7"].replace(0, np.nan)
    product_df["growth_rate"] = (product_df["lag_1"] - product_df["lag_7"]) / lag_7_safe
    product_df["pct_change_7"] = s.pct_change(7)
    product_df["recent_trend_7"] = (
        (product_df["rolling_mean_3"] - product_df["rolling_mean_7"])
        / product_df["rolling_mean_7"].replace(0, np.nan)
    )

    product_df["target"] = s.shift(-1)

    product_df["month_sin"] = np.sin(2 * np.pi * product_df["month"] / 12.0)
    product_df["month_cos"] = np.cos(2 * np.pi * product_df["month"] / 12.0)
    product_df["dow_sin"] = np.sin(2 * np.pi * product_df["day_of_week"] / 7.0)
    product_df["dow_cos"] = np.cos(2 * np.pi * product_df["day_of_week"] / 7.0)

    product_df = product_df.replace([np.inf, -np.inf], np.nan)

    required = [
        "lag_1",
        "lag_3",
        "lag_7",
        "lag_14",
        "rolling_mean_3",
        "rolling_mean_7",
        "rolling_mean_14",
        "rolling_std_7",
        "rolling_std_14",
        "target",
    ]
    product_df = product_df.dropna(subset=required).reset_index(drop=True)

    return product_df


def build_features(
    df: pd.DataFrame,
    festival_month_days: set[tuple[int, int]],
    temp_by_doy: dict[int, float],
) -> pd.DataFrame:
    if df.empty:
        return df

    frames = []
    for product_id, group in df.groupby("product_id"):
        category = str(group["category"].iloc[0]) if not group.empty else "UNCATEGORIZED"
        feats = build_product_features(
            product_df=group,
            product_id=int(product_id),
            category=category,
            festival_month_days=festival_month_days,
            temp_by_doy=temp_by_doy,
        )
        if not feats.empty:
            frames.append(feats)

    if not frames:
        return pd.DataFrame()

    combined = pd.concat(frames, ignore_index=True)
    return combined


def train_model(train_df: pd.DataFrame, val_df: pd.DataFrame, feature_columns: list[str]):
    X_train = train_df[feature_columns]
    y_train = train_df["target"].astype(float)

    X_val = val_df[feature_columns]
    y_val = val_df["target"].astype(float)

    model = xgb.XGBRegressor(
        n_estimators=5000,
        max_depth=6,
        learning_rate=0.03,
        subsample=0.9,
        colsample_bytree=0.9,
        min_child_weight=1,
        reg_alpha=0.05,
        reg_lambda=1.5,
        gamma=0.0,
        objective="reg:squarederror",
        random_state=RANDOM_STATE,
        n_jobs=-1,
        tree_method="hist",
        eval_metric="mae",
    )

    model.fit(
        X_train,
        y_train,
        eval_set=[(X_val, y_val)],
        verbose=100,
        early_stopping_rounds=100,
    )
    return model


def evaluate_model(model, val_df: pd.DataFrame, feature_columns: list[str]) -> dict:
    X_val = val_df[feature_columns]
    y_val = val_df["target"].astype(float).to_numpy()

    preds = np.clip(model.predict(X_val), 0, None)

    mae = float(mean_absolute_error(y_val, preds))
    rmse = float(np.sqrt(mean_squared_error(y_val, preds)))
    mape = float(safe_mape(y_val, preds))
    r2 = float(r2_score(y_val, preds)) if len(y_val) > 1 else 0.0

    baseline = val_df["lag_1"].astype(float).to_numpy()
    baseline_mae = float(mean_absolute_error(y_val, baseline))
    baseline_rmse = float(np.sqrt(mean_squared_error(y_val, baseline)))
    baseline_mape = float(safe_mape(y_val, baseline))

    return {
        "validation_mae": mae,
        "validation_rmse": rmse,
        "validation_mape": mape,
        "validation_r2": r2,
        "baseline_mae": baseline_mae,
        "baseline_rmse": baseline_rmse,
        "baseline_mape": baseline_mape,
        "beats_baseline": bool(mae < baseline_mae),
        "validation_rows": int(len(val_df)),
        "best_iteration": int(getattr(model, "best_iteration", -1) or -1),
    }


def save_artifacts(model, category_encoder: LabelEncoder, feature_columns: list[str], metrics: dict) -> None:
    ensure_output_dir()

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    with open(ENCODER_PATH, "wb") as f:
        pickle.dump(category_encoder, f)

    with open(FEATURE_COLUMNS_PATH, "w", encoding="utf-8") as f:
        json.dump(feature_columns, f, indent=2)

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    booster = model.get_booster()
    score_map = booster.get_score(importance_type="gain")

    rows = []
    for feat in feature_columns:
        rows.append(
            {
                "feature": feat,
                "importance_gain": float(score_map.get(feat, 0.0)),
            }
        )

    fi_df = pd.DataFrame(rows).sort_values("importance_gain", ascending=False)
    fi_df.to_csv(FEATURE_IMPORTANCE_PATH, index=False)


def run():
    ensure_output_dir()

    festival_month_days = load_festival_month_days()
    temp_by_doy = load_climatological_temp_by_day_of_year()

    df = load_daily_sales_df()
    if df.empty:
        raise RuntimeError("No sales data found in the database.")

    df = build_features(df, festival_month_days, temp_by_doy)
    if df.empty:
        raise RuntimeError("Not enough data after feature engineering to train the forecasting model.")

    category_encoder = LabelEncoder()
    df["category_encoded"] = category_encoder.fit_transform(df["category"].astype(str))

    feature_columns = build_feature_columns()
    missing_cols = [c for c in feature_columns if c not in df.columns]
    if missing_cols:
        raise RuntimeError(f"Missing training columns after feature engineering: {missing_cols}")

    cutoff_date = df["date"].max() - pd.Timedelta(days=VALIDATION_DAYS)
    train_df = df[df["date"] <= cutoff_date].copy()
    val_df = df[df["date"] > cutoff_date].copy()

    if train_df.empty or val_df.empty:
        raise RuntimeError(
            f"Train/validation split failed. train_rows={len(train_df)}, val_rows={len(val_df)}"
        )

    print(f"Train rows: {len(train_df)}, Validation rows: {len(val_df)} (last {VALIDATION_DAYS} days)")

    model = train_model(train_df, val_df, feature_columns)
    metrics = evaluate_model(model, val_df, feature_columns)

    print(f"Validation MAE:  {metrics['validation_mae']:.3f} units/day")
    print(f"Validation RMSE: {metrics['validation_rmse']:.3f} units/day")
    print(f"Validation MAPE: {metrics['validation_mape']:.2f}%")
    print(f"Validation R²:   {metrics['validation_r2']:.4f}")
    print(f"Naive baseline MAE:  {metrics['baseline_mae']:.3f} units/day")
    print(f"Naive baseline RMSE: {metrics['baseline_rmse']:.3f} units/day")
    print(f"Naive baseline MAPE: {metrics['baseline_mape']:.2f}%")
    print(f"Model {'beats' if metrics['beats_baseline'] else 'does NOT beat'} the naive baseline.")

    save_artifacts(model, category_encoder, feature_columns, metrics)

    print(f"Saved model to {MODEL_PATH}")
    print(f"Saved category encoder to {ENCODER_PATH}")
    print(f"Saved feature column order to {FEATURE_COLUMNS_PATH}")
    print(f"Saved metrics to {METRICS_PATH}")
    print(f"Saved feature importance to {FEATURE_IMPORTANCE_PATH}")


if __name__ == "__main__":
    run()