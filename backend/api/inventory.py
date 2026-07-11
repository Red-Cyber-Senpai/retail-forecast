from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.core.deps import (
    get_current_active_user,
    manager_required,
)
from backend.database.session import get_db
from backend.models.user import User
from backend.schemas.inventory import (
    StockUpdate,
    InventoryResponse,
    InventoryLogResponse,
)
from backend.services.inventory_service import (
    add_stock,
    remove_stock,
    get_inventory,
    get_inventory_by_product,
    get_low_stock,
    get_inventory_logs,
)

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"],
)


@router.get("/", response_model=list[InventoryResponse])
def inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_inventory(db)


@router.get("/low-stock", response_model=list[InventoryResponse])
def low_stock(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_low_stock(db)


@router.get("/logs", response_model=list[InventoryLogResponse])
def inventory_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_inventory_logs(db)


@router.get("/{product_id}", response_model=InventoryResponse)
def inventory_for_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_inventory_by_product(db, product_id)


@router.get("/{product_id}/logs", response_model=list[InventoryLogResponse])
def inventory_logs_for_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_inventory_logs(db, product_id)


@router.post("/add", response_model=InventoryResponse)
def stock_in(
    data: StockUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_required),
):
    return add_stock(
        db,
        data.product_id,
        data.quantity,
        data.remarks,
    )


@router.post("/remove", response_model=InventoryResponse)
def stock_out(
    data: StockUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_required),
):
    return remove_stock(
        db,
        data.product_id,
        data.quantity,
        data.remarks,
    )