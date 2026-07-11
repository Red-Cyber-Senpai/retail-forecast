from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class InsightItem(BaseModel):
    type: str
    priority: str
    title: str
    message: str

    product_id: Optional[int] = None
    product_name: Optional[str] = None
    category: Optional[str] = None

    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None

    suggested_quantity: Optional[int] = None
    confidence: Optional[float] = None


class InsightResponse(BaseModel):
    business_health_score: int
    grade: str
    status: str

    critical_count: int
    high_count: int
    medium_count: int
    low_count: int

    recommendations: list[InsightItem]