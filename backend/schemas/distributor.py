from pydantic import BaseModel
from typing import Optional


class DistributorCreate(BaseModel):
    company_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    region: Optional[str] = None


class DistributorResponse(DistributorCreate):
    id: int

    class Config:
        from_attributes = True