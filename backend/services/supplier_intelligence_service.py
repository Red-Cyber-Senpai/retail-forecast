from sqlalchemy.orm import Session

from backend.models.order import Order
from backend.models.supplier import Supplier


DELIVERED_STATUSES = {
    "DELIVERED",
    "COMPLETED",
    "RECEIVED",
    "FULFILLED",
}

CANCELLED_STATUSES = {
    "CANCELLED",
    "CANCELED",
    "REJECTED",
    "VOID",
}


def _norm_status(value: str | None) -> str:
    return (value or "").strip().upper()


def _recommendation(
    total_orders: int,
    delivered_orders: int,
    cancelled_orders: int,
    open_orders: int,
    reliability_score: float,
):
    if total_orders == 0:
        return (
            "No order history yet.",
            "LOW",
        )

    if cancelled_orders >= max(1, total_orders * 0.3):
        return (
            "Supplier needs review because cancellation rate is high.",
            "HIGH",
        )

    if open_orders > 0 and reliability_score < 70:
        return (
            "Open orders are still pending and reliability is weak.",
            "HIGH",
        )

    if (
        reliability_score >= 90
        and cancelled_orders == 0
        and open_orders == 0
    ):
        return (
            "Very reliable supplier. Good candidate for priority ordering.",
            "LOW",
        )

    if reliability_score >= 75:
        return (
            "Supplier is reasonably reliable. Keep in the active rotation.",
            "MEDIUM",
        )

    return (
        "Supplier performance is below target. Monitor closely before placing new orders.",
        "HIGH",
    )


def get_supplier_intelligence(
    db: Session,
    limit: int = 20,
):
    suppliers = (
        db.query(Supplier)
        .order_by(Supplier.id.desc())
        .limit(limit)
        .all()
    )

    results = []

    for supplier in suppliers:

        orders = (
            db.query(Order)
            .filter(Order.supplier_id == supplier.id)
            .order_by(Order.created_at.desc())
            .all()
        )

        total_orders = len(orders)
        delivered_orders = 0
        cancelled_orders = 0
        total_order_value = 0.0
        last_order_at = None

        for order in orders:

            status = _norm_status(order.status)

            if status in DELIVERED_STATUSES:
                delivered_orders += 1

            elif status in CANCELLED_STATUSES:
                cancelled_orders += 1

            if order.total_amount:
                total_order_value += float(order.total_amount)

            if (
                last_order_at is None
                and getattr(order, "created_at", None) is not None
            ):
                last_order_at = order.created_at

        open_orders = max(
            0,
            total_orders - delivered_orders - cancelled_orders,
        )

        reliability_score = (
            round(
                delivered_orders / total_orders * 100,
                2,
            )
            if total_orders > 0
            else 0.0
        )

        recommendation, priority_level = _recommendation(
            total_orders=total_orders,
            delivered_orders=delivered_orders,
            cancelled_orders=cancelled_orders,
            open_orders=open_orders,
            reliability_score=reliability_score,
        )

        results.append(
            {
                "supplier_id": supplier.id,
                "company_name": supplier.company_name,
                "email": supplier.email,
                "phone": supplier.phone,
                "address": supplier.address,
                "total_orders": total_orders,
                "total_order_value": round(total_order_value, 2),
                "delivered_orders": delivered_orders,
                "cancelled_orders": cancelled_orders,
                "open_orders": open_orders,
                "reliability_score": reliability_score,
                "recommendation": recommendation,
                "priority_level": priority_level,
                "last_order_at": last_order_at,
            }
        )

    results.sort(
        key=lambda x: (
            x["priority_level"] != "LOW",
            -x["reliability_score"],
            -x["total_orders"],
        )
    )

    return results