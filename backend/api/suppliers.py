from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.session import get_db

from backend.schemas.supplier import SupplierCreate
from backend.crud.supplier import (
    create_supplier,
    get_suppliers,
    get_supplier,
    delete_supplier,
)

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"]
)


@router.get("/")
def read_suppliers(db: Session = Depends(get_db)):
    return get_suppliers(db)


@router.get("/{supplier_id}")
def read_supplier(
    supplier_id: int,
    db: Session = Depends(get_db)
):
    return get_supplier(db, supplier_id)


@router.post("/")
def add_supplier(
    supplier: SupplierCreate,
    db: Session = Depends(get_db)
):
    return create_supplier(db, supplier)


@router.delete("/{supplier_id}")
def remove_supplier(
    supplier_id: int,
    db: Session = Depends(get_db)
):
    return delete_supplier(db, supplier_id)