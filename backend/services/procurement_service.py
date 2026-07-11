from __future__ import annotations

from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models.distributor import Distributor
from backend.models.order import Order
from backend.models.product import Product
from backend.schemas.order import OrderCreate, OrderItemCreate
from backend.services.order_service import create_order
from backend.services.recommendation_service import get_recommendations


def get_procurement_suggestions(db: Session, limit: int = 10) -> list[dict]:
    raw_recommendations = get_recommendations(
        db,
        limit=max(limit * 3, 20),
        candidate_limit=max(limit * 5, 25),
    )

    suggestions: list[dict] = []

    for rec in raw_recommendations:
        if rec.get("action") != "REORDER":
            continue

        recommended_qty = int(rec.get("recommended_order_quantity") or 0)
        if recommended_qty <= 0:
            continue

        product = (
            db.query(Product)
            .filter(Product.id == rec["product_id"])
            .first()
        )
        if not product:
            continue

        unit_price = float(product.selling_price or 0.0)
        estimated_total_cost = round(unit_price * recommended_qty, 2)

        suggestions.append(
            {
                "product_id": product.id,
                "product_name": product.name,
                "category": product.category,
                "current_stock": int(rec.get("current_stock") or 0),
                "minimum_stock": int(rec.get("minimum_stock") or 0),
                "maximum_stock": int(rec.get("maximum_stock") or 0),
                "action": rec.get("action", "REORDER"),
                "reason": rec.get("reason", ""),
                "predicted_total": float(rec.get("predicted_total") or 0.0),
                "predicted_daily_average": float(rec.get("predicted_daily_average") or 0.0),
                "days_until_stockout": float(rec.get("days_until_stockout") or 999.0),
                "forecast_confidence": float(rec.get("forecast_confidence") or 0.0),
                "recommended_order_quantity": recommended_qty,
                "urgency_score": float(rec.get("urgency_score") or 0.0),
                "unit_price": round(unit_price, 2),
                "estimated_total_cost": estimated_total_cost,
                "forecast": rec.get("forecast", []),
            }
        )

    suggestions.sort(
        key=lambda x: (
            -x["urgency_score"],
            x["days_until_stockout"],
            -x["recommended_order_quantity"],
            -x["estimated_total_cost"],
        )
    )

    return suggestions[:limit]


def list_retailer_orders(db: Session, limit: int = 20) -> list[Order]:
    return (
        db.query(Order)
        .filter(Order.order_type == "RETAILER_TO_DISTRIBUTOR")
        .order_by(Order.created_at.desc())
        .limit(limit)
        .all()
    )


def create_procurement_order_from_ai(
    db: Session,
    distributor_id: Optional[int] = None,
    limit: int = 10,
):
    if distributor_id is not None:
        distributor = (
            db.query(Distributor)
            .filter(Distributor.id == distributor_id)
            .first()
        )
        if not distributor:
            raise HTTPException(status_code=404, detail="Distributor not found")

    suggestions = get_procurement_suggestions(db, limit=limit)

    if not suggestions:
        raise HTTPException(
            status_code=404,
            detail="No AI procurement suggestions available",
        )

    items = []
    for suggestion in suggestions:
        qty = int(suggestion["recommended_order_quantity"])
        if qty <= 0:
            continue
        items.append(
            OrderItemCreate(
                product_id=suggestion["product_id"],
                quantity=qty,
            )
        )

    if not items:
        raise HTTPException(
            status_code=404,
            detail="No valid order items could be created from the current recommendations",
        )

    order_data = OrderCreate(
        order_type="RETAILER_TO_DISTRIBUTOR",
        distributor_id=distributor_id,
        items=items,
    )

    return create_order(db, order_data)