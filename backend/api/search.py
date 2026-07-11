from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database.session import get_db
from backend.models.product import Product

router = APIRouter(
    prefix="/search",
    tags=["Search"]
)


@router.get("/")
def smart_search(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    search = f"%{q}%"

    products = (
        db.query(Product)
        .filter(
            or_(
                Product.name.ilike(search),
                Product.brand.ilike(search),
                Product.category.ilike(search),
                Product.barcode.ilike(search),
            )
        )
        .limit(limit)
        .all()
    )

    return {
        "count": len(products),
        "results": products
    }