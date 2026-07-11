from pydantic import BaseModel
from typing import Optional


class SupplierCreate(BaseModel):
    company_name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    lead_time_days: int = 7


class SupplierResponse(SupplierCreate):
    id: int

    class Config:
        from_attributes = True