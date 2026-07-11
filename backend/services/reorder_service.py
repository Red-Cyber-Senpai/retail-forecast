from sqlalchemy.orm import Session

from backend.models.inventory import Inventory
from backend.models.product import Product


def get_reorder_recommendations(db: Session):
    inventory_items = db.query(Inventory).all()

    recommendations = []

    for item in inventory_items:

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        if product is None:
            continue

        if item.quantity == 0:
            priority = "CRITICAL"

        elif item.quantity <= item.reorder_level:
            priority = "HIGH"

        elif item.quantity <= item.minimum_stock:
            priority = "MEDIUM"

        else:
            continue

        recommended_quantity = max(
            item.maximum_stock - item.quantity,
            item.minimum_stock * 2,
        )

        recommendations.append(
            {
                "product_id": product.id,
                "barcode": product.barcode,
                "product_name": product.name,
                "brand": product.brand,
                "category": product.category,
                "current_stock": item.quantity,
                "minimum_stock": item.minimum_stock,
                "maximum_stock": item.maximum_stock,
                "reorder_level": item.reorder_level,
                "recommended_order_quantity": recommended_quantity,
                "priority": priority,
                "reason": (
                    "Product is out of stock."
                    if priority == "CRITICAL"
                    else "Stock has reached the reorder threshold."
                ),
            }
        )

    recommendations.sort(
        key=lambda x: (
            x["priority"] != "CRITICAL",
            x["priority"] != "HIGH",
            x["current_stock"],
        )
    )

    return recommendations