from pydantic import BaseModel
from typing import Optional


class ProductCreate(BaseModel):
    barcode: str
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    unit: str = "pcs"
    cost_price: float = 0
    selling_price: float = 0
    currency: str = "INR"

    supplier_id: Optional[int] = None
    purchase_price: float = 0
    minimum_order_quantity: int = 1


class ProductResponse(ProductCreate):
    id: int

    class Config:
        from_attributes = True