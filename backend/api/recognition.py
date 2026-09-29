from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.schemas.recognition import RecognitionResult, RecognitionConfirmCreate
from backend.schemas.product import ProductResponse
from backend.services.recognition_service import scan_image, confirm_new_product

router = APIRouter(
    prefix="/recognition",
    tags=["Recognition"]
)


@router.post("/scan", response_model=RecognitionResult)
async def scan(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    image_bytes = await file.read()

    try:
        predicted_category, confidence, matched_products = scan_image(db, image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return RecognitionResult(
        predicted_category=predicted_category,
        confidence=confidence,
        matched_products=matched_products
    )


@router.post("/confirm", response_model=ProductResponse)
def confirm(
    data: RecognitionConfirmCreate,
    db: Session = Depends(get_db)
):
    return confirm_new_product(db, data)
