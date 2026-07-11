from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.schemas.forecast import ForecastResponse
from backend.services.forecast_service import get_forecast_for_product

router = APIRouter(
    prefix="/forecast",
    tags=["Forecast"]
)


@router.get("/{product_id}", response_model=ForecastResponse)
def forecast_product(
    product_id: int,
    days: int = Query(default=7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    return get_forecast_for_product(db, product_id, days)