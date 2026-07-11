from typing import List, Optional

from pydantic import BaseModel


class ForecastDay(BaseModel):
    date: str
    predicted_quantity: float
    confidence: Optional[float] = None


class ForecastResponse(BaseModel):
    product_id: int
    product_name: str
    category: str

    current_stock: int
    minimum_stock: int

    forecast: List[ForecastDay]

    predicted_total: float
    predicted_daily_average: float

    forecast_confidence: float

    days_until_stockout: float

    recommend_reorder: bool
    recommended_order_quantity: int

    recommended_supplier: Optional[str] = None

    ai_recommendation: str