from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.models.inventory import Inventory
from backend.models.order import Order
from backend.models.product import Product
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem


def _sale_item_unit_price(item: SaleItem) -> float:
    for field in ("unit_price", "price", "selling_price", "amount"):
        value = getattr(item, field, None)
        if value is not None:
            try:
                return float(value)
            except (TypeError, ValueError):
                pass
    return 0.0


def get_dashboard_stats(db: Session):
    catalog_products = db.query(Product).count()

    active_products = (
        db.query(Product)
        .join(Inventory, Inventory.product_id == Product.id)
        .count()
    )

    inventories = db.query(Inventory).all()

    total_stock_units = sum(int(inv.quantity or 0) for inv in inventories)
    low_stock_count = sum(
        1
        for inv in inventories
        if int(inv.quantity or 0) <= int(inv.reorder_level or inv.minimum_stock or 0)
    )

    total_inventory_cost_value = 0.0
    total_inventory_retail_value = 0.0
    for inv in inventories:
        product = db.query(Product).filter(Product.id == inv.product_id).first()
        if product:
            qty = float(inv.quantity or 0)
            total_inventory_cost_value += qty * float(product.cost_price or 0)
            total_inventory_retail_value += qty * float(product.selling_price or 0)

    today = datetime.utcnow().date()
    tomorrow = today + timedelta(days=1)

    todays_sales = (
        db.query(Sale)
        .filter(Sale.created_at >= today, Sale.created_at < tomorrow)
        .all()
    )

    todays_revenue = sum(float(s.total_amount or 0) for s in todays_sales)
    todays_units_sold = (
        db.query(func.coalesce(func.sum(SaleItem.quantity), 0))
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(Sale.created_at >= today, Sale.created_at < tomorrow)
        .scalar()
        or 0
    )

    all_time_revenue = (
        db.query(func.coalesce(func.sum(Sale.total_amount), 0))
        .scalar()
        or 0
    )

    # Top products by sales units and revenue
    sale_items = (
        db.query(SaleItem, Product)
        .join(Product, Product.id == SaleItem.product_id)
        .all()
    )

    product_rollup = {}
    category_rollup = defaultdict(lambda: {"units_sold": 0, "revenue": 0.0})

    for item, product in sale_items:
        qty = int(getattr(item, "quantity", 0) or 0)
        unit_price = _sale_item_unit_price(item)
        revenue = qty * unit_price

        if product.id not in product_rollup:
            product_rollup[product.id] = {
                "product_id": product.id,
                "name": product.name,
                "category": product.category,
                "units_sold": 0,
                "revenue": 0.0,
            }

        product_rollup[product.id]["units_sold"] += qty
        product_rollup[product.id]["revenue"] += revenue

        category = product.category or "Unknown"
        category_rollup[category]["units_sold"] += qty
        category_rollup[category]["revenue"] += revenue

    top_selling_products = sorted(
        product_rollup.values(),
        key=lambda x: (x["units_sold"], x["revenue"]),
        reverse=True,
    )[:10]

    category_breakdown = sorted(
        [
            {
                "category": category,
                "units_sold": values["units_sold"],
                "revenue": round(values["revenue"], 2),
            }
            for category, values in category_rollup.items()
        ],
        key=lambda x: (x["units_sold"], x["revenue"]),
        reverse=True,
    )[:10]

    recent_sales_rows = (
        db.query(Sale)
        .order_by(Sale.created_at.desc())
        .limit(10)
        .all()
    )

    recent_sales = []
    for sale in recent_sales_rows:
        item_count = (
            db.query(func.coalesce(func.sum(SaleItem.quantity), 0))
            .filter(SaleItem.sale_id == sale.id)
            .scalar()
            or 0
        )
        recent_sales.append(
            {
                "sale_id": sale.id,
                "total_amount": float(sale.total_amount or 0),
                "created_at": sale.created_at,
                "item_count": int(item_count),
            }
        )

    recent_orders_rows = (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .limit(10)
        .all()
    )

    recent_orders = [
        {
            "order_id": order.id,
            "order_type": order.order_type,
            "status": order.status,
            "total_amount": float(order.total_amount or 0),
            "created_at": order.created_at,
        }
        for order in recent_orders_rows
    ]

    return {
        "active_products": int(active_products),
        "catalog_products": int(catalog_products),
        "total_stock_units": int(total_stock_units),
        "low_stock_count": int(low_stock_count),
        "todays_revenue": round(float(todays_revenue), 2),
        "todays_units_sold": int(todays_units_sold),
        "all_time_revenue": round(float(all_time_revenue), 2),
        "top_selling_products": [
            {
                "product_id": item["product_id"],
                "name": item["name"],
                "category": item["category"],
                "units_sold": int(item["units_sold"]),
                "revenue": round(float(item["revenue"]), 2),
            }
            for item in top_selling_products
        ],
        "category_breakdown": category_breakdown,
        "recent_sales": recent_sales,
        "recent_orders": recent_orders,
    }