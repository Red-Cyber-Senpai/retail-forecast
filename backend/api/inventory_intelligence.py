from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.services.inventory_intelligence_service import inventory_health

router = APIRouter(
    prefix="/inventory-intelligence",
    tags=["Inventory Intelligence"],
)


@router.get("/")
def inventory_dashboard(
    db: Session = Depends(get_db),
):
    return inventory_health(db)