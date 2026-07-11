from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.schemas.supplier_insights import SupplierInsight
from backend.services.supplier_intelligence_service import get_supplier_intelligence

router = APIRouter(
    prefix="/supplier-intelligence",
    tags=["Supplier Intelligence"]
)


@router.get("/", response_model=list[SupplierInsight])
def supplier_intelligence(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return get_supplier_intelligence(db, limit=limit)