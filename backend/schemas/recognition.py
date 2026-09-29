from pydantic import BaseModel
from typing import List, Optional

from backend.schemas.product import ProductResponse


class RecognitionResult(BaseModel):
    predicted_category: str
    confidence: float
    matched_products: List[ProductResponse] = []


class RecognitionConfirmCreate(BaseModel):
    name: str
    category: str
    brand: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    unit: str = "pcs"
    cost_price: float = 0
    selling_price: float = 0
    currency: str = "INR"

    supplier_id: Optional[int] = None
    purchase_price: float = 0
    minimum_order_quantity: int = 1


class ShelfDetection(BaseModel):
    product: str
    confidence: float
    quantity: int
    bbox: List[float]


class ShelfScanResult(BaseModel):
    total_products: int
    detected_classes: int
    shelf_fill_percentage: float
    detections: List[ShelfDetection]