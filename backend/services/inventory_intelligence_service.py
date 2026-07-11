from sqlalchemy.orm import Session

from backend.models.inventory import Inventory
from backend.models.product import Product


def inventory_health(db: Session):
    inventory = db.query(Inventory).all()

    total_products = len(inventory)

    low_stock = 0
    healthy_stock = 0
    over_stock = 0
    out_of_stock = 0

    results = []

    for item in inventory:

        status = "Healthy"

        if item.quantity == 0:
            status = "Out of Stock"
            out_of_stock += 1

        elif item.quantity <= item.reorder_level:
            status = "Low Stock"
            low_stock += 1

        elif item.maximum_stock > 0 and item.quantity >= item.maximum_stock:
            status = "Over Stock"
            over_stock += 1

        else:
            healthy_stock += 1

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        results.append(
            {
                "product_id": item.product_id,
                "product_name": product.name if product else None,
                "barcode": product.barcode if product else None,
                "category": product.category if product else None,
                "quantity": item.quantity,
                "minimum_stock": item.minimum_stock,
                "maximum_stock": item.maximum_stock,
                "reorder_level": item.reorder_level,
                "status": status,
            }
        )

    return {
        "summary": {
            "total_products": total_products,
            "healthy_stock": healthy_stock,
            "low_stock": low_stock,
            "out_of_stock": out_of_stock,
            "over_stock": over_stock,
        },
        "products": results,
    }