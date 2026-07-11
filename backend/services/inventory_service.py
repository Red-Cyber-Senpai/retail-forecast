from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models.inventory import Inventory
from backend.models.inventory_log import InventoryLog


def add_stock(db: Session, product_id: int, quantity: int, remarks: str):
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")

    inventory = (
        db.query(Inventory)
        .filter(Inventory.product_id == product_id)
        .first()
    )
    if inventory is None:
        inventory = Inventory(
            product_id=product_id,
            quantity=0
        )
        db.add(inventory)

    inventory.quantity += quantity

    log = InventoryLog(
        product_id=product_id,
        action="STOCK_IN",
        quantity=quantity,
        remarks=remarks
    )
    db.add(log)
    db.commit()
    db.refresh(inventory)
    return inventory


def remove_stock(db: Session, product_id: int, quantity: int, remarks: str):
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")

    inventory = (
        db.query(Inventory)
        .filter(Inventory.product_id == product_id)
        .first()
    )
    if inventory is None:
        raise HTTPException(status_code=404, detail="Inventory record not found for this product")

    if inventory.quantity < quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {inventory.quantity}, requested: {quantity}"
        )

    inventory.quantity -= quantity

    log = InventoryLog(
        product_id=product_id,
        action="STOCK_OUT",
        quantity=quantity,
        remarks=remarks
    )
    db.add(log)
    db.commit()
    db.refresh(inventory)
    return inventory


def get_inventory(db: Session):
    return db.query(Inventory).all()


def get_inventory_by_product(db: Session, product_id: int):
    inventory = (
        db.query(Inventory)
        .filter(Inventory.product_id == product_id)
        .first()
    )
    if inventory is None:
        raise HTTPException(status_code=404, detail="Inventory record not found for this product")
    return inventory


def get_low_stock(db: Session):
    return (
        db.query(Inventory)
        .filter(Inventory.quantity <= Inventory.reorder_level)
        .all()
    )


def get_inventory_logs(db: Session, product_id: int = None):
    query = db.query(InventoryLog)
    if product_id is not None:
        query = query.filter(InventoryLog.product_id == product_id)
    return query.order_by(InventoryLog.id.desc()).all()