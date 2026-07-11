from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.core.deps import get_current_active_user
from backend.database.session import get_db
from backend.models.user import User
from backend.schemas.insights import InsightResponse
from backend.services.insight_service import get_ai_insights

router = APIRouter(
    prefix="/insights",
    tags=["AI Insights"],
)


@router.get("/", response_model=InsightResponse)
def insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_ai_insights(db)