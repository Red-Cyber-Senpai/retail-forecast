from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.core.deps import get_current_active_user
from backend.database.session import get_db
from backend.models.user import User
from backend.schemas.dashboard import DashboardStats
from backend.services.dashboard_service import get_dashboard_stats

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_dashboard_stats(db)


@router.get("/summary", response_model=DashboardStats)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_dashboard_stats(db)