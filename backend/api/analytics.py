from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.schemas.analytics import AnalyticsSummary
from backend.services.analytics_service import get_analytics_summary

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/summary", response_model=AnalyticsSummary)
def summary(db: Session = Depends(get_db)):
    return get_analytics_summary(db)