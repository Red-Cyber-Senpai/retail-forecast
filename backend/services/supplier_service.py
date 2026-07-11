from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models.supplier import Supplier
from backend.schemas.supplier import SupplierCreate


def create_supplier(db: Session, supplier: SupplierCreate):
    db_supplier = Supplier(**supplier.model_dump())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


def get_suppliers(db: Session):
    return db.query(Supplier).all()


def get_supplier_by_id(db: Session, supplier_id: int):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


def update_supplier(db: Session, supplier_id: int, data: SupplierCreate):
    supplier = get_supplier_by_id(db, supplier_id)
    for field, value in data.model_dump().items():
        setattr(supplier, field, value)
    db.commit()
    db.refresh(supplier)
    return supplier


def delete_supplier(db: Session, supplier_id: int):
    supplier = get_supplier_by_id(db, supplier_id)
    db.delete(supplier)
    db.commit()
    return {"detail": "Supplier deleted"}