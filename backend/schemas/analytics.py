from datetime import date
from typing import List, Optional

from pydantic import BaseModel


class SalesTrendPoint(BaseModel):
    date: date
    revenue: float
    units_sold: int


class TopProductInsight(BaseModel):
    product_id: int
    name: str
    category: Optional[str] = None
    units_sold: int
    revenue: float


class TopCategoryInsight(BaseModel):
    category: str
    units_sold: int
    revenue: float


class LowStockInsight(BaseModel):
    product_id: int
    name: str
    category: Optional[str] = None
    current_stock: int
    minimum_stock: int
    reorder_level: int
    suggested_reorder: int


class RecentOrderInsight(BaseModel):
    order_id: int
    order_type: str
    status: str
    total_amount: float
    created_at: Optional[str] = None


class AnalyticsSummary(BaseModel):
    total_products: int
    active_inventory_items: int
    total_stock_units: int
    low_stock_count: int
    total_inventory_cost_value: float
    total_inventory_retail_value: float

    top_selling_products: List[TopProductInsight]
    top_categories: List[TopCategoryInsight]
    low_stock_products: List[LowStockInsight]
    sales_trend_30d: List[SalesTrendPoint]
    recent_orders: List[RecentOrderInsight]