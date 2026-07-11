from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.schemas.sale import SaleCreate, SaleResponse
from backend.services.sale_service import create_sale, get_sales, get_sale_by_id

router = APIRouter(
    prefix="/sales",
    tags=["Sales"]
)


@router.post("/", response_model=SaleResponse)
def sale(
    data: SaleCreate,
    db: Session = Depends(get_db)
):
    return create_sale(db, data.items)


@router.get("/", response_model=list[SaleResponse])
def sales(db: Session = Depends(get_db)):
    return get_sales(db)


@router.get("/{sale_id}", response_model=SaleResponse)
def sale_detail(sale_id: int, db: Session = Depends(get_db)):
    return get_sale_by_id(db, sale_id)