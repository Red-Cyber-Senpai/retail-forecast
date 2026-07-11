from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int


class SaleCreate(BaseModel):
    items: List[SaleItemCreate]


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float

    class Config:
        from_attributes = True


class SaleResponse(BaseModel):
    id: int
    total_amount: float
    created_at: Optional[datetime] = None
    items: List[SaleItemResponse] = []

    class Config:
        from_attributes = True