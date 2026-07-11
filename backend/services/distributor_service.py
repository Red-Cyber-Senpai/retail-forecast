from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models.distributor import Distributor
from backend.schemas.distributor import DistributorCreate


def create_distributor(db: Session, distributor: DistributorCreate):
    db_distributor = Distributor(**distributor.model_dump())
    db.add(db_distributor)
    db.commit()
    db.refresh(db_distributor)
    return db_distributor


def get_distributors(db: Session):
    return db.query(Distributor).all()


def get_distributor_by_id(db: Session, distributor_id: int):
    distributor = db.query(Distributor).filter(Distributor.id == distributor_id).first()
    if distributor is None:
        raise HTTPException(status_code=404, detail="Distributor not found")
    return distributor


def update_distributor(db: Session, distributor_id: int, data: DistributorCreate):
    distributor = get_distributor_by_id(db, distributor_id)
    for field, value in data.model_dump().items():
        setattr(distributor, field, value)
    db.commit()
    db.refresh(distributor)
    return distributor


def delete_distributor(db: Session, distributor_id: int):
    distributor = get_distributor_by_id(db, distributor_id)
    db.delete(distributor)
    db.commit()
    return {"detail": "Distributor deleted"}