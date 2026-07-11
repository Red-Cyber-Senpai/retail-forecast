from typing import Optional

from pydantic import BaseModel


class SupplierInsight(BaseModel):
    supplier_id: int
    company_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    total_orders: int
    total_order_value: float
    delivered_orders: int
    cancelled_orders: int
    open_orders: int

    reliability_score: float
    recommendation: str
    priority_level: str

    last_order_at: Optional[str] = None