from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.ai.barcode import decode_barcodes_from_image_bytes, lookup_product_by_barcode
from backend.database.session import get_db
from backend.schemas.barcode import BarcodeLookupResponse

router = APIRouter(
    prefix="/barcode",
    tags=["Barcode"]
)


@router.get("/{barcode}", response_model=BarcodeLookupResponse)
def get_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
):
    result = lookup_product_by_barcode(db, barcode)
    if not result:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "barcode": result["barcode"],
        "product": result["product"],
        "inventory": result["inventory"],
    }


@router.post("/scan")
async def scan_barcode(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    image_bytes = await file.read()
    barcodes = decode_barcodes_from_image_bytes(image_bytes)

    matches = []
    for code in barcodes:
        result = lookup_product_by_barcode(db, code)
        if result:
            matches.append(
                {
                    "barcode": result["barcode"],
                    "product": result["product"],
                    "inventory": result["inventory"],
                }
            )

    return {
        "decoded_barcodes": barcodes,
        "matches": matches,
        "match_count": len(matches),
    }