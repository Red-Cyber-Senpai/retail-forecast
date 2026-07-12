from __future__ import annotations

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import pickle

ROOT_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT_DIR / "models" / "forecast"
MODEL_PATH = MODEL_DIR / "xgboost.pkl"
ENCODER_PATH = MODEL_DIR / "label_encoder.pkl"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.json"
FESTIVAL_CSV = ROOT_DIR / "datasets" / "raw" / "festivals" / "festival_calendar.csv"

_MODEL = None
_ENCODER = None
_FEATURE_COLUMNS: list[str] | None = None
_FESTIVAL_MONTH_DAYS: set[tuple[int, int]] | None = None


def load_festival_month_days() -> set[tuple[int, int]]:
    global _FESTIVAL_MONTH_DAYS
    if _FESTIVAL_MONTH_DAYS is not None:
        return _FESTIVAL_MONTH_DAYS

    festival_month_days: set[tuple[int, int]] = set()

    if FESTIVAL_CSV.exists():
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

    _FESTIVAL_MONTH_DAYS = festival_month_days
    return festival_month_days


def load_model():
    global _MODEL
    if _MODEL is not None:
        return _MODEL

    if not MODEL_PATH.exists():
        raise RuntimeError(f"Missing model file: {MODEL_PATH}")

    with open(MODEL_PATH, "rb") as f:
        _MODEL = pickle.load(f)
    return _MODEL


def load_encoder():
    global _ENCODER
    if _ENCODER is not None:
        return _ENCODER

    if not ENCODER_PATH.exists():
        raise RuntimeError(f"Missing encoder file: {ENCODER_PATH}")

    with open(ENCODER_PATH, "rb") as f:
        _ENCODER = pickle.load(f)
    return _ENCODER


def load_feature_columns() -> list[str]:
    global _FEATURE_COLUMNS
    if _FEATURE_COLUMNS is not None:
        return _FEATURE_COLUMNS

    if not FEATURE_COLUMNS_PATH.exists():
        raise RuntimeError(f"Missing feature columns file: {FEATURE_COLUMNS_PATH}")

    with open(FEATURE_COLUMNS_PATH, "r", encoding="utf-8") as f:
        _FEATURE_COLUMNS = json.load(f)

    if not isinstance(_FEATURE_COLUMNS, list) or not _FEATURE_COLUMNS:
        raise RuntimeError("Invalid feature columns file")

    return _FEATURE_COLUMNS


def parse_reference_date(raw_value: Any) -> datetime.date:
    if raw_value is None or raw_value == "":
        return datetime.utcnow().date()

    if isinstance(raw_value, datetime):
        return raw_value.date()

    try:
        return datetime.fromisoformat(str(raw_value)).date()
    except ValueError:
        return datetime.utcnow().date()


def encode_category(category: str) -> int:
    encoder = load_encoder()
    try:
        return int(encoder.transform([str(category)])[0])
    except Exception:
        return 0


def estimate_confidence(history: list[float], step: int) -> float:
    recent = np.asarray(history[-14:] if len(history) >= 14 else history, dtype=float)
    if recent.size == 0:
        return 0.60

    mean_val = float(np.mean(recent))
    std_val = float(np.std(recent))
    volatility = std_val / (mean_val + 1.0)

    confidence = 0.95 - (step * 0.015) - min(0.18, volatility * 0.14)
    confidence = max(0.55, min(0.98, confidence))
    return round(float(confidence), 3)


def build_feature_row(
    product_id: int,
    category: str,
    forecast_date: datetime.date,
    history: list[float],
    cost_price: float,
    selling_price: float,
) -> dict[str, Any]:
    feature_columns = load_feature_columns()
    festival_month_days = load_festival_month_days()

    if not history:
        history = [0.0] * 28

    if len(history) < 28:
        history = [history[0]] * (28 - len(history)) + history

    s = pd.Series(history, dtype=float)

    day_of_week = forecast_date.weekday()
    day_of_month = forecast_date.day
    week_of_year = int(forecast_date.isocalendar().week)
    month = forecast_date.month
    quarter = (month - 1) // 3 + 1
    is_weekend = int(day_of_week >= 5)
    is_month_start = int(day_of_month == 1)
    next_day = forecast_date + timedelta(days=1)
    is_month_end = int(next_day.month != month)
    is_festival = int((forecast_date.month, forecast_date.day) in festival_month_days)

    lag_1 = float(s.iloc[-1])
    lag_3 = float(s.iloc[-3])
    lag_7 = float(s.iloc[-7])
    lag_14 = float(s.iloc[-14])
    lag_28 = float(s.iloc[-28])

    shifted = s.shift(1)
    rolling_mean_3 = float(shifted.rolling(3).mean().iloc[-1])
    rolling_mean_7 = float(shifted.rolling(7).mean().iloc[-1])
    rolling_mean_14 = float(shifted.rolling(14).mean().iloc[-1])
    rolling_mean_28 = float(shifted.rolling(28).mean().iloc[-1])

    rolling_std_7 = float(shifted.rolling(7).std().iloc[-1])
    rolling_std_14 = float(shifted.rolling(14).std().iloc[-1])
    rolling_max_7 = float(shifted.rolling(7).max().iloc[-1])
    rolling_min_7 = float(shifted.rolling(7).min().iloc[-1])

    growth_7 = float((lag_1 - lag_7) / lag_7) if lag_7 != 0 else 0.0
    growth_14 = float((lag_1 - lag_14) / lag_14) if lag_14 != 0 else 0.0
    pct_change_7 = float(s.pct_change(7).iloc[-1]) if len(s) > 7 else 0.0
    trend_7 = float(
        (rolling_mean_3 - rolling_mean_7) / rolling_mean_7
        if rolling_mean_7 != 0
        else 0.0
    )

    cost_price = float(cost_price or 0.0)
    selling_price = float(selling_price or 0.0)
    price_gap = selling_price - cost_price
    price_ratio = selling_price / (cost_price + 1.0)

    row = {
        "product_id": int(product_id),
        "category_encoded": encode_category(category),
        "cost_price": cost_price,
        "selling_price": selling_price,
        "price_gap": price_gap,
        "price_ratio": price_ratio,
        "day_of_week": day_of_week,
        "day_of_month": day_of_month,
        "week_of_year": week_of_year,
        "month": month,
        "quarter": quarter,
        "is_weekend": is_weekend,
        "is_month_start": is_month_start,
        "is_month_end": is_month_end,
        "is_festival": is_festival,
        "lag_1": lag_1,
        "lag_3": lag_3,
        "lag_7": lag_7,
        "lag_14": lag_14,
        "lag_28": lag_28,
        "rolling_mean_3": rolling_mean_3,
        "rolling_mean_7": rolling_mean_7,
        "rolling_mean_14": rolling_mean_14,
        "rolling_mean_28": rolling_mean_28,
        "rolling_std_7": rolling_std_7,
        "rolling_std_14": rolling_std_14,
        "rolling_max_7": rolling_max_7,
        "rolling_min_7": rolling_min_7,
        "growth_7": growth_7,
        "growth_14": growth_14,
        "pct_change_7": pct_change_7,
        "trend_7": trend_7,
        "month_sin": float(np.sin(2 * np.pi * month / 12.0)),
        "month_cos": float(np.cos(2 * np.pi * month / 12.0)),
        "dow_sin": float(np.sin(2 * np.pi * day_of_week / 7.0)),
        "dow_cos": float(np.cos(2 * np.pi * day_of_week / 7.0)),
    }

    aligned = {col: row.get(col, 0.0) for col in feature_columns}
    return aligned


def predict_one_step(model, row: dict[str, Any]) -> float:
    feature_columns = load_feature_columns()
    X = pd.DataFrame([row], columns=feature_columns)
    pred = float(model.predict(X)[0])
    return max(0.0, pred)


def main():
    raw_input = sys.stdin.read()
    payload = json.loads(raw_input)

    product_id = int(payload["product_id"])
    category = str(payload["category"])
    recent_quantities = [float(x) for x in payload.get("recent_quantities", [])]
    days = int(payload.get("days", 7))
    reference_date = parse_reference_date(payload.get("reference_date"))
    cost_price = float(payload.get("cost_price", 0.0) or 0.0)
    selling_price = float(payload.get("selling_price", 0.0) or 0.0)

    model = load_model()
    _ = load_encoder()
    _ = load_feature_columns()

    history = list(recent_quantities)
    if not history:
        history = [0.0] * 28

    if len(history) < 28:
        history = [history[0]] * (28 - len(history)) + history

    predictions = []

    for step in range(days):
        forecast_date = reference_date + timedelta(days=step + 1)

        row = build_feature_row(
            product_id=product_id,
            category=category,
            forecast_date=forecast_date,
            history=history,
            cost_price=cost_price,
            selling_price=selling_price,
        )

        pred = predict_one_step(model, row)
        confidence = estimate_confidence(history, step)

        predictions.append(
            {
                "date": forecast_date.isoformat(),
                "predicted_quantity": round(pred, 2),
                "confidence": confidence,
            }
        )

        history.append(pred)

    print(json.dumps(predictions))


if __name__ == "__main__":
    main()