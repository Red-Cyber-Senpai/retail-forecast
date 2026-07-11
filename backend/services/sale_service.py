from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models.inventory import Inventory
from backend.models.inventory_log import InventoryLog
from backend.models.product import Product
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem


def create_sale(db: Session, items: list):
    if not items:
        raise HTTPException(status_code=400, detail="Sale must include at least one item")

    # Validate every item BEFORE making any changes, so a bad item
    # anywhere in the cart doesn't leave partial stock deductions behind.
    resolved = []
    for entry in items:
        product = db.query(Product).filter(Product.id == entry.product_id).first()
        if product is None:
            raise HTTPException(status_code=404, detail=f"Product {entry.product_id} not found")

        inventory = (
            db.query(Inventory)
            .filter(Inventory.product_id == entry.product_id)
            .first()
        )
        if inventory is None:
            raise HTTPException(
                status_code=404,
                detail=f"Product {entry.product_id} not found in inventory"
            )
        if inventory.quantity < entry.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product {entry.product_id}. "
                       f"Available: {inventory.quantity}, requested: {entry.quantity}"
            )

        resolved.append((product, inventory, entry.quantity))

    sale = Sale(total_amount=0)
    db.add(sale)
    db.flush()

    total = 0.0
    for product, inventory, quantity in resolved:
        inventory.quantity -= quantity

        line_total = product.selling_price * quantity
        total += line_total

        item = SaleItem(
            sale_id=sale.id,
            product_id=product.id,
            quantity=quantity,
            price=product.selling_price
        )
        db.add(item)

        log = InventoryLog(
            product_id=product.id,
            action="SALE",
            quantity=quantity,
            remarks=f"POS Sale #{sale.id}"
        )
        db.add(log)

    sale.total_amount = total
    db.commit()
    db.refresh(sale)
    return sale


def get_sales(db: Session):
    return db.query(Sale).order_by(Sale.id.desc()).all()


def get_sale_by_id(db: Session, sale_id: int):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale