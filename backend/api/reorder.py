from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.services.reorder_service import get_reorder_recommendations

router = APIRouter(
    prefix="/reorder",
    tags=["Smart Reorder"],
)


@router.get("/")
def smart_reorder(
    db: Session = Depends(get_db),
):
    return get_reorder_recommendations(db)