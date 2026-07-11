from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    order_type: str  # "DISTRIBUTOR_TO_SUPPLIER" or "RETAILER_TO_DISTRIBUTOR"
    supplier_id: Optional[int] = None
    distributor_id: Optional[int] = None
    items: List[OrderItemCreate]


class OrderStatusUpdate(BaseModel):
    status: str  # PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    order_type: str
    supplier_id: Optional[int] = None
    distributor_id: Optional[int] = None
    total_amount: float
    status: str
    created_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True