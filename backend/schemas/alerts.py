from pydantic import BaseModel
from typing import Optional


class AlertResponse(BaseModel):
    type: str
    severity: str
    title: str
    message: str

    product_id: Optional[int] = None
    supplier_id: Optional[int] = None
    order_id: Optional[int] = None

    class Config:
        from_attributes = True