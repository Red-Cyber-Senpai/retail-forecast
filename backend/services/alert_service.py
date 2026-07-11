from sqlalchemy.orm import Session

from backend.models.inventory import Inventory
from backend.models.product import Product
from backend.models.order import Order


def get_alerts(db: Session):
    alerts = []

    inventories = db.query(Inventory).all()

    for inventory in inventories:

        product = (
            db.query(Product)
            .filter(Product.id == inventory.product_id)
            .first()
        )

        if product is None:
            continue

        quantity = inventory.quantity or 0
        reorder = inventory.reorder_level or 0

        if quantity == 0:

            alerts.append(
                {
                    "type": "OUT_OF_STOCK",
                    "severity": "CRITICAL",
                    "title": "Out of Stock",
                    "message": f"{product.name} is out of stock.",
                    "product_id": product.id,
                }
            )

        elif quantity <= reorder:

            alerts.append(
                {
                    "type": "LOW_STOCK",
                    "severity": "HIGH",
                    "title": "Low Stock",
                    "message": f"{product.name} has only {quantity} units remaining.",
                    "product_id": product.id,
                }
            )

    pending_orders = (
        db.query(Order)
        .filter(Order.status == "PENDING")
        .all()
    )

    for order in pending_orders:

        alerts.append(
            {
                "type": "PENDING_ORDER",
                "severity": "MEDIUM",
                "title": "Pending Order",
                "message": f"Purchase Order #{order.id} is still pending.",
                "order_id": order.id,
            }
        )

    return alerts