from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StockUpdate(BaseModel):
    product_id: int
    quantity: int
    remarks: str = ""


class InventoryResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    minimum_stock: int
    maximum_stock: int
    reorder_level: int

    class Config:
        from_attributes = True


class InventoryLogResponse(BaseModel):
    id: int
    product_id: int
    action: str
    quantity: int
    remarks: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True