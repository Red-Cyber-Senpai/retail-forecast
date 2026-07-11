from statistics import mean

from sqlalchemy.orm import Session

from backend.models.inventory import Inventory
from backend.models.product import Product
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem
from backend.ai.forecast import forecast_next_days


def get_recommendations(
    db: Session,
    limit: int = 10,
    candidate_limit: int = 25,
):
    inventories = (
        db.query(Inventory)
        .limit(candidate_limit)
        .all()
    )

    recommendations = []

    for inv in inventories:

        product = (
            db.query(Product)
            .filter(Product.id == inv.product_id)
            .first()
        )

        if not product:
            continue

        sales = (
            db.query(SaleItem.quantity)
            .join(
                Sale,
                Sale.id == SaleItem.sale_id
            )
            .filter(
                SaleItem.product_id == product.id
            )
            .order_by(Sale.created_at.desc())
            .limit(14)
            .all()
        )

        recent = [float(x.quantity) for x in sales]

        if len(recent) < 5:
            continue

        forecast = forecast_next_days(
            product_id=product.id,
            category=product.category,
            recent_quantities=list(reversed(recent)),
            days=7,
        )

        predicted_total = sum(
            d["predicted_quantity"]
            for d in forecast
        )

        predicted_daily = mean(
            d["predicted_quantity"]
            for d in forecast
        )

        confidence = mean(
            d["confidence"]
            for d in forecast
        )

        days_until_stockout = (
            inv.quantity / predicted_daily
            if predicted_daily > 0
            else 999
        )

        reorder_qty = max(
            0,
            round(predicted_total - inv.quantity)
        )

        urgency = (
            predicted_total
            - inv.quantity
            + inv.minimum_stock
        )

        if reorder_qty > 0:
            action = "REORDER"
            reason = "Predicted stock shortage"
        else:
            action = "SUFFICIENT"
            reason = "Inventory level is healthy"

        recommendations.append(
            {
                "product_id": product.id,
                "product_name": product.name,
                "category": product.category,
                "current_stock": inv.quantity,
                "minimum_stock": inv.minimum_stock,
                "maximum_stock": inv.maximum_stock,
                "action": action,
                "reason": reason,
                "predicted_total": round(predicted_total,2),
                "predicted_daily_average": round(predicted_daily,2),
                "days_until_stockout": round(days_until_stockout,1),
                "forecast_confidence": round(confidence,3),
                "recommended_order_quantity": reorder_qty,
                "urgency_score": round(urgency,2),
                "forecast": forecast,
            }
        )

    recommendations.sort(
        key=lambda x: x["urgency_score"],
        reverse=True,
    )

    return recommendations[:limit]