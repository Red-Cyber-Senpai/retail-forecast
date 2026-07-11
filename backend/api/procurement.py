from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.schemas.order import OrderResponse
from backend.schemas.procurement import (
    CreateProcurementOrderRequest,
    ProcurementSuggestion,
)
from backend.services.procurement_service import (
    create_procurement_order_from_ai,
    get_procurement_suggestions,
    list_retailer_orders,
)

router = APIRouter(
    prefix="/procurement",
    tags=["Procurement"]
)


@router.get("/suggestions", response_model=list[ProcurementSuggestion])
def procurement_suggestions(
    limit: int = Query(default=10, ge=1, le=25),
    db: Session = Depends(get_db),
):
    return get_procurement_suggestions(db, limit=limit)


@router.get("/orders", response_model=list[OrderResponse])
def procurement_orders(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return list_retailer_orders(db, limit=limit)


@router.post("/create-order", response_model=OrderResponse)
def create_order_from_ai(
    payload: CreateProcurementOrderRequest,
    db: Session = Depends(get_db),
):
    return create_procurement_order_from_ai(
        db,
        distributor_id=payload.distributor_id,
        limit=payload.limit,
    )