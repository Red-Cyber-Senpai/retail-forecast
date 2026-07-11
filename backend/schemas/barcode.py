from typing import Optional

from pydantic import BaseModel

from backend.schemas.inventory import InventoryResponse
from backend.schemas.product import ProductResponse


class BarcodeLookupResponse(BaseModel):
    barcode: str
    product: ProductResponse
    inventory: Optional[InventoryResponse] = None