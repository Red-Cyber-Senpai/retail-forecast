from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models.order import Order
from backend.models.order_item import OrderItem
from backend.models.product import Product
from backend.models.supplier import Supplier
from backend.models.distributor import Distributor
from backend.models.inventory import Inventory
from backend.models.inventory_log import InventoryLog

VALID_ORDER_TYPES = {"DISTRIBUTOR_TO_SUPPLIER", "RETAILER_TO_DISTRIBUTOR"}
VALID_STATUSES = {"PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"}


def create_order(db: Session, data):
    if data.order_type not in VALID_ORDER_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid order_type. Must be one of {VALID_ORDER_TYPES}")

    if not data.items:
        raise HTTPException(status_code=400, detail="Order must include at least one item")

    if data.order_type == "DISTRIBUTOR_TO_SUPPLIER":
        if data.supplier_id is None:
            raise HTTPException(status_code=400, detail="supplier_id is required for DISTRIBUTOR_TO_SUPPLIER orders")
        if db.query(Supplier).filter(Supplier.id == data.supplier_id).first() is None:
            raise HTTPException(status_code=404, detail="Supplier not found")

    if data.order_type == "RETAILER_TO_DISTRIBUTOR":
        if data.distributor_id is None:
            raise HTTPException(status_code=400, detail="distributor_id is required for RETAILER_TO_DISTRIBUTOR orders")
        if db.query(Distributor).filter(Distributor.id == data.distributor_id).first() is None:
            raise HTTPException(status_code=404, detail="Distributor not found")

    resolved = []
    for entry in data.items:
        product = db.query(Product).filter(Product.id == entry.product_id).first()
        if product is None:
            raise HTTPException(status_code=404, detail=f"Product {entry.product_id} not found")
        resolved.append((product, entry.quantity))

    order = Order(
        order_type=data.order_type,
        supplier_id=data.supplier_id,
        distributor_id=data.distributor_id,
        total_amount=0,
        status="PENDING"
    )
    db.add(order)
    db.flush()

    total = 0.0
    for product, quantity in resolved:
        line_total = product.cost_price * quantity
        total += line_total

        item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=quantity,
            price=product.cost_price
        )
        db.add(item)

    order.total_amount = total
    db.commit()
    db.refresh(order)
    return order


def get_orders(db: Session):
    return db.query(Order).order_by(Order.id.desc()).all()


def get_order_by_id(db: Session, order_id: int):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


def update_order_status(db: Session, order_id: int, new_status: str):
    if new_status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {VALID_STATUSES}")

    order = get_order_by_id(db, order_id)

    if order.status == "DELIVERED":
        raise HTTPException(status_code=400, detail="Cannot change status of a delivered order")
    if order.status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Cannot change status of a cancelled order")

    order.status = new_status

    # Closing the loop: when a retailer's restock order arrives, add the stock in.
    if new_status == "DELIVERED" and order.order_type == "RETAILER_TO_DISTRIBUTOR":
        for item in order.items:
            inventory = (
                db.query(Inventory)
                .filter(Inventory.product_id == item.product_id)
                .first()
            )
            if inventory is None:
                inventory = Inventory(product_id=item.product_id, quantity=0)
                db.add(inventory)
                db.flush()

            inventory.quantity += item.quantity

            log = InventoryLog(
                product_id=item.product_id,
                action="STOCK_IN",
                quantity=item.quantity,
                remarks=f"Order #{order.id} delivered"
            )
            db.add(log)

    db.commit()
    db.refresh(order)
    return order