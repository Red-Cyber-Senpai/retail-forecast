from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.core.deps import get_current_active_user
from backend.models.user import User

from backend.schemas.alerts import AlertResponse
from backend.services.alert_service import get_alerts

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
)


@router.get(
    "/",
    response_model=list[AlertResponse],
)
def alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_alerts(db)