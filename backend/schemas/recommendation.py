from typing import List, Optional

from pydantic import BaseModel, Field


class RecommendationForecastDay(BaseModel):
    date: str
    predicted_quantity: float
    confidence: Optional[float] = None


class RecommendationResponse(BaseModel):
    product_id: int
    product_name: str
    category: Optional[str] = None

    current_stock: int
    minimum_stock: int
    maximum_stock: int

    action: str  # REORDER or MONITOR
    reason: str

    predicted_total: float = 0.0
    predicted_daily_average: float = 0.0
    days_until_stockout: float = 999.0
    forecast_confidence: float = 0.0

    recommended_order_quantity: int = 0
    urgency_score: float = 0.0

    forecast: List[RecommendationForecastDay] = Field(default_factory=list)