from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.core.deps import (
    get_current_active_user,
    manager_required,
    admin_required,
)
from backend.database.session import get_db
from backend.models.user import User
from backend.schemas.supplier import (
    SupplierCreate,
    SupplierResponse,
)
from backend.services.supplier_service import (
    create_supplier,
    get_suppliers,
    get_supplier_by_id,
    update_supplier,
    delete_supplier,
)

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"],
)


@router.post("/", response_model=SupplierResponse)
def add_supplier(
    supplier: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_required),
):
    return create_supplier(db, supplier)


@router.get("/", response_model=list[SupplierResponse])
def list_suppliers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_suppliers(db)


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_supplier_by_id(db, supplier_id)


@router.put("/{supplier_id}", response_model=SupplierResponse)
def edit_supplier(
    supplier_id: int,
    supplier: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_required),
):
    return update_supplier(
        db,
        supplier_id,
        supplier,
    )


@router.delete("/{supplier_id}")
def remove_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    return delete_supplier(
        db,
        supplier_id,
    )