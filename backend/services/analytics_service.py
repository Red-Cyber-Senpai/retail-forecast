from collections import defaultdict
from datetime import date, datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.models.inventory import Inventory
from backend.models.order import Order
from backend.models.product import Product
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem


def _safe_float(value) -> float:
    if value is None:
        return 0.0
    try:
        return float(value)
    except Exception:
        return 0.0


def get_analytics_summary(db: Session):
    total_products = db.query(Product).count()
    active_inventory_items = db.query(Inventory).count()

    total_stock_units = db.query(func.sum(Inventory.quantity)).scalar() or 0
    low_stock_count = (
        db.query(Inventory)
        .filter(Inventory.quantity <= Inventory.minimum_stock)
        .count()
    )

    inventory_rows = (
        db.query(
            Inventory.quantity,
            Product.cost_price,
            Product.selling_price,
        )
        .join(Product, Product.id == Inventory.product_id)
        .all()
    )

    total_inventory_cost_value = 0.0
    total_inventory_retail_value = 0.0
    for quantity, cost_price, selling_price in inventory_rows:
        total_inventory_cost_value += _safe_float(quantity) * _safe_float(cost_price)
        total_inventory_retail_value += _safe_float(quantity) * _safe_float(selling_price)

    # Top selling products
    top_product_rows = (
        db.query(
            SaleItem.product_id,
            func.sum(SaleItem.quantity).label("units_sold"),
            func.sum(SaleItem.quantity * SaleItem.price).label("revenue"),
        )
        .group_by(SaleItem.product_id)
        .order_by(func.sum(SaleItem.quantity).desc())
        .limit(10)
        .all()
    )

    top_product_ids = [row.product_id for row in top_product_rows]
    product_lookup = {
        p.id: p
        for p in db.query(Product).filter(Product.id.in_(top_product_ids)).all()
    }

    top_selling_products = []
    for row in top_product_rows:
        product = product_lookup.get(row.product_id)
        top_selling_products.append(
            {
                "product_id": row.product_id,
                "name": product.name if product else "Unknown",
                "category": product.category if product else None,
                "units_sold": int(row.units_sold or 0),
                "revenue": round(_safe_float(row.revenue), 2),
            }
        )

    # Top categories
    category_rows = (
        db.query(
            Product.category,
            func.sum(SaleItem.quantity).label("units_sold"),
            func.sum(SaleItem.quantity * SaleItem.price).label("revenue"),
        )
        .join(SaleItem, SaleItem.product_id == Product.id)
        .group_by(Product.category)
        .order_by(func.sum(SaleItem.quantity * SaleItem.price).desc())
        .limit(10)
        .all()
    )

    top_categories = [
        {
            "category": row.category or "Uncategorized",
            "units_sold": int(row.units_sold or 0),
            "revenue": round(_safe_float(row.revenue), 2),
        }
        for row in category_rows
    ]

    # Low stock products
    low_stock_rows = (
        db.query(Inventory, Product)
        .join(Product, Product.id == Inventory.product_id)
        .filter(Inventory.quantity <= Inventory.minimum_stock)
        .order_by(Inventory.quantity.asc())
        .limit(10)
        .all()
    )

    low_stock_products = []
    for inventory, product in low_stock_rows:
        suggested_reorder = max(
            0,
            int(inventory.maximum_stock - inventory.quantity),
        )
        low_stock_products.append(
            {
                "product_id": product.id,
                "name": product.name,
                "category": product.category,
                "current_stock": inventory.quantity,
                "minimum_stock": inventory.minimum_stock,
                "reorder_level": inventory.reorder_level,
                "suggested_reorder": suggested_reorder,
            }
        )

    # Sales trend for last 30 days
    start_date = date.today() - timedelta(days=29)
    sales_rows = (
        db.query(
            func.date(Sale.created_at).label("sale_date"),
            func.sum(Sale.total_amount).label("revenue"),
            func.sum(SaleItem.quantity).label("units_sold"),
        )
        .join(SaleItem, SaleItem.sale_id == Sale.id)
        .filter(Sale.created_at >= datetime.combine(start_date, datetime.min.time()))
        .group_by(func.date(Sale.created_at))
        .order_by(func.date(Sale.created_at).asc())
        .all()
    )

    sales_map = {}
    for row in sales_rows:
        key = row.sale_date
        if isinstance(key, str):
            try:
                key = date.fromisoformat(key)
            except Exception:
                continue
        sales_map[key] = {
            "date": key,
            "revenue": round(_safe_float(row.revenue), 2),
            "units_sold": int(row.units_sold or 0),
        }

    sales_trend_30d = []
    for i in range(30):
        d = start_date + timedelta(days=i)
        sales_trend_30d.append(
            sales_map.get(
                d,
                {
                    "date": d,
                    "revenue": 0.0,
                    "units_sold": 0,
                },
            )
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
            "total_amount": round(_safe_float(order.total_amount), 2),
            "created_at": order.created_at.isoformat() if order.created_at else None,
        }
        for order in recent_orders_rows
    ]

    return {
        "total_products": total_products,
        "active_inventory_items": active_inventory_items,
        "total_stock_units": int(total_stock_units or 0),
        "low_stock_count": low_stock_count,
        "total_inventory_cost_value": round(total_inventory_cost_value, 2),
        "total_inventory_retail_value": round(total_inventory_retail_value, 2),
        "top_selling_products": top_selling_products,
        "top_categories": top_categories,
        "low_stock_products": low_stock_products,
        "sales_trend_30d": sales_trend_30d,
        "recent_orders": recent_orders,
    }