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


def get_supplier(db: Session, supplier_id: int):
    return db.query(Supplier).filter(Supplier.id == supplier_id).first()


def delete_supplier(db: Session, supplier_id: int):
    supplier = get_supplier(db, supplier_id)

    if supplier:
        db.delete(supplier)
        db.commit()

    return supplier