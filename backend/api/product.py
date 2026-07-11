from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.core.deps import (
    get_current_active_user,
    manager_required,
    admin_required,
)
from backend.database.session import get_db
from backend.models.product import Product
from backend.models.user import User
from backend.schemas.product import ProductCreate, ProductResponse
from backend.services.product_service import (
    create_product,
    get_product_by_id,
    update_product,
    delete_product,
)

router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


@router.post("/", response_model=ProductResponse)
def add_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_required),
):
    return create_product(db, product)


@router.get("/", response_model=list[ProductResponse])
def list_products(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    q: str | None = Query(default=None),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Product)

    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Product.name.ilike(search),
                Product.brand.ilike(search),
                Product.barcode.ilike(search),
                Product.category.ilike(search),
            )
        )

    if category:
        query = query.filter(Product.category.ilike(category))

    return (
        query.order_by(Product.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/barcode/{barcode}", response_model=ProductResponse)
def get_product_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    product = (
        db.query(Product)
        .filter(Product.barcode == barcode)
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.get("/supplier/{supplier_id}", response_model=list[ProductResponse])
def get_products_by_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return (
        db.query(Product)
        .filter(Product.supplier_id == supplier_id)
        .order_by(Product.id.desc())
        .all()
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return get_product_by_id(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def edit_product(
    product_id: int,
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(manager_required),
):
    return update_product(db, product_id, product)


@router.delete("/{product_id}")
def remove_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    return delete_product(db, product_id)