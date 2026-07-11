from __future__ import annotations

from typing import List, Optional

from sqlalchemy.orm import Session

from backend.models.inventory import Inventory
from backend.models.product import Product

try:
    import cv2
    import numpy as np
    from pyzbar.pyzbar import decode as zbar_decode
except Exception:
    cv2 = None
    np = None
    zbar_decode = None


def normalize_barcode(value: str) -> str:
    return "".join(ch for ch in str(value).strip() if ch.isalnum())


def lookup_product_by_barcode(db: Session, barcode: str) -> Optional[dict]:
    clean = normalize_barcode(barcode)
    if not clean:
        return None

    product = db.query(Product).filter(Product.barcode == clean).first()
    if not product:
        return None

    inventory = db.query(Inventory).filter(Inventory.product_id == product.id).first()

    return {
        "barcode": product.barcode,
        "product": product,
        "inventory": inventory,
    }


def decode_barcodes_from_image_bytes(image_bytes: bytes) -> List[str]:
    if cv2 is None or np is None or zbar_decode is None:
        return []

    array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        return []

    decoded = zbar_decode(image)
    barcodes: List[str] = []

    for item in decoded:
        data = item.data.decode("utf-8", errors="ignore").strip()
        if data:
            barcodes.append(normalize_barcode(data))

    # dedupe while preserving order
    seen = set()
    unique = []
    for code in barcodes:
        if code and code not in seen:
            seen.add(code)
            unique.append(code)

    return unique