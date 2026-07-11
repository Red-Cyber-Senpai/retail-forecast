import io
import json
import os

import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms

MODEL_PATH = "models/vision/product_classifier.pt"
CLASSES_PATH = "models/vision/class_names.json"

_device = (
    torch.device("mps") if torch.backends.mps.is_available()
    else torch.device("cuda") if torch.cuda.is_available()
    else torch.device("cpu")
)

_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

_model = None
_class_names = None


def _load_model():
    global _model, _class_names

    if _model is not None:
        return

    if not os.path.exists(MODEL_PATH) or not os.path.exists(CLASSES_PATH):
        raise RuntimeError(
            "Product classifier model not found. Run 'python -m ml.train_classifier' first."
        )

    with open(CLASSES_PATH, "r") as f:
        _class_names = json.load(f)

    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = nn.Linear(model.last_channel, len(_class_names))
    model.load_state_dict(torch.load(MODEL_PATH, map_location=_device))
    model.to(_device)
    model.eval()

    _model = model


def predict_category(image_bytes: bytes):
    """
    Takes raw image bytes (from an uploaded photo) and returns
    (predicted_category: str, confidence: float, all_scores: dict).
    """
    _load_model()

    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise ValueError("Could not read uploaded file as an image")

    tensor = _transform(image).unsqueeze(0).to(_device)

    with torch.no_grad():
        outputs = _model(tensor)
        probs = torch.softmax(outputs, dim=1)[0]

    top_idx = int(torch.argmax(probs).item())
    predicted_category = _class_names[top_idx]
    confidence = float(probs[top_idx].item())

    all_scores = {
        _class_names[i]: float(probs[i].item())
        for i in range(len(_class_names))
    }

    return predicted_category, confidence, all_scores