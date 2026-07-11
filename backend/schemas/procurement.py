from typing import List, Optional

from pydantic import BaseModel, Field


class ProcurementSuggestion(BaseModel):
    product_id: int
    product_name: str
    category: Optional[str] = None

    current_stock: int
    minimum_stock: int
    maximum_stock: int

    action: str
    reason: str

    predicted_total: float
    predicted_daily_average: float
    days_until_stockout: float
    forecast_confidence: float

    recommended_order_quantity: int
    urgency_score: float

    unit_price: float
    estimated_total_cost: float

    forecast: List[dict] = Field(default_factory=list)


class CreateProcurementOrderRequest(BaseModel):
    distributor_id: Optional[int] = None
    limit: int = Field(default=10, ge=1, le=25)