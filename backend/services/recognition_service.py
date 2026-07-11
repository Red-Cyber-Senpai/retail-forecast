from __future__ import annotations

import io
import json
import secrets
from pathlib import Path
from typing import List, Optional, Tuple

import torch
import torch.nn as nn
from PIL import Image
from sqlalchemy.orm import Session
from torchvision import models, transforms

from backend.ai.barcode import decode_barcodes_from_image_bytes, lookup_product_by_barcode
from backend.models.product import Product

MODEL_PATH = Path("models/vision/product_classifier.pt")
CLASS_NAMES_PATH = Path("models/vision/class_names.json")

DEVICE = (
    torch.device("mps")
    if torch.backends.mps.is_available()
    else torch.device("cuda")
    if torch.cuda.is_available()
    else torch.device("cpu")
)

_IMAGE_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ]
)

_MODEL = None
_CLASS_NAMES: list[str] | None = None


def _load_class_names() -> list[str]:
    global _CLASS_NAMES
    if _CLASS_NAMES is not None:
        return _CLASS_NAMES

    if not CLASS_NAMES_PATH.exists():
        raise RuntimeError(f"Missing class names file: {CLASS_NAMES_PATH}")

    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
        _CLASS_NAMES = json.load(f)

    if not isinstance(_CLASS_NAMES, list) or not _CLASS_NAMES:
        raise RuntimeError("Invalid class names file")

    return _CLASS_NAMES


def _load_model():
    global _MODEL
    if _MODEL is not None:
        return _MODEL

    class_names = _load_class_names()

    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = nn.Linear(model.last_channel, len(class_names))

    if not MODEL_PATH.exists():
        raise RuntimeError(f"Missing vision model file: {MODEL_PATH}")

    state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
    model.load_state_dict(state_dict)
    model.to(DEVICE)
    model.eval()

    _MODEL = model
    return _MODEL


def _predict_category_from_image_bytes(image_bytes: bytes) -> tuple[str, float]:
    model = _load_model()
    class_names = _load_class_names()

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = _IMAGE_TRANSFORM(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1)[0]
        confidence, index = torch.max(probs, dim=0)

    predicted_idx = int(index.item())
    predicted_category = class_names[predicted_idx] if predicted_idx < len(class_names) else "Unknown"
    return predicted_category, float(confidence.item())


def _products_for_category(db: Session, category: str, limit: int = 10) -> list[Product]:
    if not category:
        return []

    search = f"%{category}%"
    return (
        db.query(Product)
        .filter(Product.category.ilike(search))
        .order_by(Product.id.desc())
        .limit(limit)
        .all()
    )


def _internal_barcode(name: str, category: str) -> str:
    slug = "".join(ch for ch in f"{name}-{category}" if ch.isalnum()).upper()
    suffix = secrets.token_hex(4).upper()
    return f"INTERNAL-{slug[:24]}-{suffix}"


def scan_image(db: Session, image_bytes: bytes) -> Tuple[str, float, list[Product]]:
    """
    Try barcode first. If no barcode is found, fall back to the vision classifier.
    Returns: (predicted_category, confidence, matched_products)
    """
    decoded_barcodes = decode_barcodes_from_image_bytes(image_bytes)

    for barcode in decoded_barcodes:
        result = lookup_product_by_barcode(db, barcode)
        if result and result.get("product") is not None:
            product: Product = result["product"]
            matched_products = (
                _products_for_category(db, product.category or "", limit=10)
                or [product]
            )
            return product.category or "Unknown", 0.99, matched_products

    predicted_category, confidence = _predict_category_from_image_bytes(image_bytes)
    matched_products = _products_for_category(db, predicted_category, limit=10)
    return predicted_category or "Unknown", round(confidence, 3), matched_products


def confirm_new_product(db: Session, data):
    """
    Create a new product from recognition confirmation.
    """
    barcode = _internal_barcode(data.name, data.category)

    product = Product(
        barcode=barcode,
        name=data.name,
        brand=data.brand,
        category=data.category,
        description=data.description,
        image_url=data.image_url,
        unit=data.unit or "pcs",
        cost_price=data.cost_price or 0.0,
        selling_price=data.selling_price or 0.0,
        currency="INR",
    )

    db.add(product)
    db.commit()
    db.refresh(product)
    return product