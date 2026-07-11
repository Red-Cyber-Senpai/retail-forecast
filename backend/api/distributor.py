from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.schemas.distributor import DistributorCreate, DistributorResponse
from backend.services.distributor_service import (
    create_distributor,
    get_distributors,
    get_distributor_by_id,
    update_distributor,
    delete_distributor,
)

router = APIRouter(
    prefix="/distributors",
    tags=["Distributors"]
)


@router.post("/", response_model=DistributorResponse)
def add_distributor(
    distributor: DistributorCreate,
    db: Session = Depends(get_db)
):
    return create_distributor(db, distributor)


@router.get("/", response_model=list[DistributorResponse])
def list_distributors(db: Session = Depends(get_db)):
    return get_distributors(db)


@router.get("/{distributor_id}", response_model=DistributorResponse)
def get_distributor(distributor_id: int, db: Session = Depends(get_db)):
    return get_distributor_by_id(db, distributor_id)


@router.put("/{distributor_id}", response_model=DistributorResponse)
def edit_distributor(
    distributor_id: int,
    distributor: DistributorCreate,
    db: Session = Depends(get_db)
):
    return update_distributor(db, distributor_id, distributor)


@router.delete("/{distributor_id}")
def remove_distributor(distributor_id: int, db: Session = Depends(get_db)):
    return delete_distributor(db, distributor_id)