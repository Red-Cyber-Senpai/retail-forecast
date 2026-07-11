from statistics import mean

import pandas as pd
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.ai.forecast import forecast_next_days
from backend.models.inventory import Inventory
from backend.models.product import Product
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem
from backend.models.supplier import Supplier


def get_forecast_for_product(
    db: Session,
    product_id: int,
    days: int = 7,
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    inventory = (
        db.query(Inventory)
        .filter(Inventory.product_id == product_id)
        .first()
    )

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory record not found"
        )

    rows = (
        db.query(
            Sale.created_at,
            SaleItem.quantity,
        )
        .join(
            SaleItem,
            SaleItem.sale_id == Sale.id,
        )
        .filter(
            SaleItem.product_id == product_id
        )
        .order_by(Sale.created_at.asc())
        .all()
    )

    if not rows:
        raise HTTPException(
            status_code=400,
            detail="Not enough sales history"
        )

    df = pd.DataFrame(rows, columns=["created_at", "quantity"])
    df["created_at"] = pd.to_datetime(
        df["created_at"],
        utc=True,
        errors="coerce",
    )
    df = df.dropna(subset=["created_at"])

    if df.empty:
        raise HTTPException(
            status_code=400,
            detail="Not enough sales history"
        )

    df["date"] = df["created_at"].dt.tz_convert(None).dt.normalize()
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce").fillna(0.0)

    daily = (
        df.groupby("date", as_index=False)["quantity"]
        .sum()
        .sort_values("date")
        .reset_index(drop=True)
    )

    # Use as much daily history as is available; 30 days works well if present.
    recent_daily_history = daily["quantity"].tail(max(30, days)).astype(float).tolist()
    reference_date = daily["date"].max().date().isoformat()

    if len(recent_daily_history) < 14:
        raise HTTPException(
            status_code=400,
            detail="Not enough sales history"
        )

    forecast = forecast_next_days(
        product_id=product.id,
        category=product.category or "Unknown",
        recent_quantities=recent_daily_history,
        days=days,
        reference_date=reference_date,
    )

    predicted_total = sum(
        x["predicted_quantity"]
        for x in forecast
    )

    predicted_daily = mean(
        x["predicted_quantity"]
        for x in forecast
    )

    average_confidence = mean(
        x.get("confidence", 0.8)
        for x in forecast
    )

    days_until_stockout = (
        inventory.quantity / predicted_daily
        if predicted_daily > 0
        else 999
    )

    reorder_level = max(
        inventory.minimum_stock,
        predicted_total,
    )

    recommend_reorder = (
        inventory.quantity <= reorder_level
    )

    shortage = max(
        0,
        reorder_level - inventory.quantity,
    )

    supplier = None
    supplier_id = getattr(product, "supplier_id", None)
    if supplier_id:
        supplier = (
            db.query(Supplier)
            .filter(Supplier.id == supplier_id)
            .first()
        )
    if supplier is None:
        supplier = (
            db.query(Supplier)
            .first()
        )

    if recommend_reorder:
        recommendation = (
            f"Current stock is expected to be insufficient "
            f"for the next {days} days. "
            f"Reorder approximately {round(shortage)} units."
        )
    else:
        recommendation = (
            "Current inventory is sufficient."
        )

    return {
        "product_id": product.id,
        "product_name": product.name,
        "category": product.category,
        "current_stock": inventory.quantity,
        "minimum_stock": inventory.minimum_stock,
        "forecast": forecast,
        "predicted_total": round(predicted_total, 2),
        "predicted_daily_average": round(predicted_daily, 2),
        "forecast_confidence": round(
            average_confidence,
            3,
        ),
        "days_until_stockout": round(
            days_until_stockout,
            1,
        ),
        "recommend_reorder": recommend_reorder,
        "recommended_order_quantity": round(shortage),
        "recommended_supplier": (
            supplier.company_name
            if supplier
            else None
        ),
        "ai_recommendation": recommendation,
    }