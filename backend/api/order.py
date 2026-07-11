from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.core.deps import (
    get_current_active_user,
    manager_required,
)
from backend.database.session import get_db
from backend.models.user import User
from backend.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
)
from backend.services.order_service import (
    create_order,
    get_orders,
    get_order_by_id,
    update_order_status,
)

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


@router.post("/", response_model=OrderResponse)
def add_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_required),
):
    return create_order(db, order)


@router.get("/", response_model=list[OrderResponse])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_orders(db)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_order_by_id(db, order_id)


@router.put("/{order_id}/status", response_model=OrderResponse)
def change_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_required),
):
    return update_order_status(
        db,
        order_id,
        data.status,
    )