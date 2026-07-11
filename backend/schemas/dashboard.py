from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TopProduct(BaseModel):
    product_id: int
    name: str
    category: Optional[str] = None
    units_sold: int
    revenue: float

    model_config = ConfigDict(from_attributes=True)


class CategoryBreakdown(BaseModel):
    category: Optional[str] = None
    units_sold: int
    revenue: float

    model_config = ConfigDict(from_attributes=True)


class RecentSale(BaseModel):
    sale_id: int
    total_amount: float
    created_at: datetime
    item_count: int

    model_config = ConfigDict(from_attributes=True)


class RecentOrder(BaseModel):
    order_id: int
    order_type: Optional[str] = None
    status: Optional[str] = None
    total_amount: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardStats(BaseModel):
    active_products: int
    catalog_products: int
    total_stock_units: int
    low_stock_count: int
    todays_revenue: float
    todays_units_sold: int
    all_time_revenue: float
    top_selling_products: list[TopProduct]
    category_breakdown: list[CategoryBreakdown]
    recent_sales: list[RecentSale]
    recent_orders: list[RecentOrder]

    model_config = ConfigDict(from_attributes=True)