from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models.inventory import Inventory
from backend.models.order import Order
from backend.models.product import Product
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem
from backend.models.supplier import Supplier
from backend.services.forecast_service import get_forecast_for_product


def _priority_rank(priority: str) -> int:
    priority = (priority or "").upper()
    return {
        "CRITICAL": 0,
        "HIGH": 1,
        "MEDIUM": 2,
        "LOW": 3,
        "INFO": 4,
    }.get(priority, 4)


def _status_from_score(score: int) -> tuple[str, str]:
    if score >= 90:
        return "Excellent", "A"
    if score >= 80:
        return "Very Good", "B"
    if score >= 65:
        return "Good", "C"
    if score >= 50:
        return "Watchlist", "D"
    return "Critical", "F"


def _append_insight(
    insights: list[dict],
    *,
    type_: str,
    priority: str,
    title: str,
    message: str,
    product_id: int | None = None,
    product_name: str | None = None,
    category: str | None = None,
    supplier_id: int | None = None,
    supplier_name: str | None = None,
    suggested_quantity: int | None = None,
    confidence: float | None = None,
):
    insights.append(
        {
            "type": type_,
            "priority": priority,
            "title": title,
            "message": message,
            "product_id": product_id,
            "product_name": product_name,
            "category": category,
            "supplier_id": supplier_id,
            "supplier_name": supplier_name,
            "suggested_quantity": suggested_quantity,
            "confidence": confidence,
        }
    )


def get_ai_insights(db: Session):
    now = datetime.utcnow()
    last_30_days = now - timedelta(days=30)
    last_14_days = now - timedelta(days=14)
    last_7_days = now - timedelta(days=7)

    insights: list[dict] = []

    products = db.query(Product).all()
    inventories = db.query(Inventory).all()

    product_map = {p.id: p for p in products}
    inventory_map = {i.product_id: i for i in inventories}

    sale_rows_30 = (
        db.query(SaleItem.product_id, SaleItem.quantity, Sale.created_at)
        .join(Sale, SaleItem.sale_id == Sale.id)
        .filter(Sale.created_at >= last_30_days)
        .all()
    )

    sold_30: dict[int, int] = defaultdict(int)

    for product_id, quantity, created_at in sale_rows_30:
        qty = int(quantity or 0)
        sold_30[int(product_id)] += qty

    critical_count = 0
    high_count = 0
    medium_count = 0
    low_count = 0

    for inventory in inventories:
        product = product_map.get(inventory.product_id)
        if product is None:
            continue

        quantity = int(inventory.quantity or 0)
        minimum_stock = int(inventory.minimum_stock or 0)
        maximum_stock = int(inventory.maximum_stock or 0)
        reorder_level = int(inventory.reorder_level or minimum_stock)

        if quantity == 0:
            critical_count += 1
            _append_insight(
                insights,
                type_="OUT_OF_STOCK",
                priority="CRITICAL",
                title="Out of Stock",
                message=f"{product.name} is out of stock and needs immediate attention.",
                product_id=product.id,
                product_name=product.name,
                category=product.category,
                suggested_quantity=max(maximum_stock, minimum_stock * 2, 1),
            )

        elif quantity <= reorder_level:
            high_count += 1
            suggested = max(maximum_stock - quantity, minimum_stock * 2, reorder_level * 2)
            _append_insight(
                insights,
                type_="LOW_STOCK",
                priority="HIGH",
                title="Low Stock",
                message=f"{product.name} has only {quantity} units remaining, which is at or below reorder level.",
                product_id=product.id,
                product_name=product.name,
                category=product.category,
                suggested_quantity=suggested,
            )

        elif quantity <= reorder_level + max(5, minimum_stock // 2):
            medium_count += 1
            _append_insight(
                insights,
                type_="NEAR_REORDER",
                priority="MEDIUM",
                title="Approaching Reorder Level",
                message=f"{product.name} is approaching its reorder threshold.",
                product_id=product.id,
                product_name=product.name,
                category=product.category,
                suggested_quantity=max(maximum_stock - quantity, minimum_stock),
            )

        if maximum_stock > 0 and quantity > maximum_stock:
            medium_count += 1
            _append_insight(
                insights,
                type_="OVERSTOCK",
                priority="MEDIUM",
                title="Overstock",
                message=f"{product.name} exceeds its maximum stock level.",
                product_id=product.id,
                product_name=product.name,
                category=product.category,
                suggested_quantity=max(0, quantity - maximum_stock),
            )

    for inventory in inventories:
        product = product_map.get(inventory.product_id)
        if product is None:
            continue

        quantity = int(inventory.quantity or 0)
        reorder_level = int(inventory.reorder_level or inventory.minimum_stock or 0)

        if quantity > reorder_level:
            continue

        try:
            forecast = get_forecast_for_product(db, product.id, days=7)
        except HTTPException:
            continue
        except Exception:
            continue

        if forecast.get("recommend_reorder"):
            if quantity == 0:
                critical_count += 1
            else:
                high_count += 1

            _append_insight(
                insights,
                type_="RESTOCK_NOW",
                priority="HIGH" if quantity > 0 else "CRITICAL",
                title="Restock Recommended",
                message=(
                    f"{product.name} is projected to stock out in about "
                    f"{forecast.get('days_until_stockout', 999)} days."
                ),
                product_id=product.id,
                product_name=product.name,
                category=product.category,
                suggested_quantity=int(forecast.get("recommended_order_quantity", 0) or 0),
                confidence=float(forecast.get("forecast_confidence", 0.0) or 0.0),
            )

    top_sellers = sorted(
        sold_30.items(),
        key=lambda x: x[1],
        reverse=True,
    )[:5]

    for product_id, qty in top_sellers:
        product = product_map.get(product_id)
        if product is None:
            continue

        low_count += 1
        _append_insight(
            insights,
            type_="BEST_SELLER",
            priority="LOW",
            title="Best Seller",
            message=f"{product.name} sold {qty} units in the last 30 days.",
            product_id=product.id,
            product_name=product.name,
            category=product.category,
            confidence=0.95,
        )

    for product in products:
        qty_30 = sold_30.get(product.id, 0)
        inventory = inventory_map.get(product.id)

        if inventory is None:
            continue

        current_stock = int(inventory.quantity or 0)

        if current_stock > 0 and qty_30 == 0:
            medium_count += 1
            _append_insight(
                insights,
                type_="SLOW_MOVING",
                priority="MEDIUM",
                title="Slow Moving Product",
                message=f"{product.name} has stock available but no sales in the last 30 days.",
                product_id=product.id,
                product_name=product.name,
                category=product.category,
                suggested_quantity=0,
                confidence=0.8,
            )

    suppliers = db.query(Supplier).all()
    for supplier in suppliers:
        orders = (
            db.query(Order)
            .filter(Order.supplier_id == supplier.id)
            .all()
        )

        if not orders:
            continue

        delivered = 0
        cancelled = 0
        total = len(orders)

        for order in orders:
            status = (order.status or "").strip().upper()
            if status in {"DELIVERED", "COMPLETED", "RECEIVED", "FULFILLED"}:
                delivered += 1
            elif status in {"CANCELLED", "CANCELED", "REJECTED", "VOID"}:
                cancelled += 1

        reliability = (delivered / total) * 100 if total else 0.0

        if reliability < 70:
            high_count += 1
            _append_insight(
                insights,
                type_="SUPPLIER_WARNING",
                priority="HIGH",
                title="Supplier Reliability Warning",
                message=(
                    f"{supplier.company_name} has a reliability score of "
                    f"{round(reliability, 1)}%."
                ),
                supplier_id=supplier.id,
                supplier_name=supplier.company_name,
                confidence=round(reliability / 100.0, 3),
            )

    insights.sort(
        key=lambda item: (
            _priority_rank(item["priority"]),
            item["title"],
            item["message"],
        )
    )

    score = 100
    score -= min(35, critical_count * 12)
    score -= min(20, high_count * 5)
    score -= min(10, medium_count * 2)
    score += min(5, low_count)

    score = max(0, min(100, score))
    status, grade = _status_from_score(score)

    return {
        "business_health_score": score,
        "grade": grade,
        "status": status,
        "critical_count": critical_count,
        "high_count": high_count,
        "medium_count": medium_count,
        "low_count": low_count,
        "recommendations": insights,
    }