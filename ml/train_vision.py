from __future__ import annotations

import json
import random
from collections import Counter
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, models, transforms

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "datasets" / "raw" / "grocery_images" / "freiburg" / "images"
MODEL_DIR = ROOT_DIR / "models" / "vision"
MODEL_PATH = MODEL_DIR / "product_classifier.pt"
CLASS_NAMES_PATH = MODEL_DIR / "class_names.json"
METRICS_PATH = MODEL_DIR / "classifier_metrics.json"
CONFUSION_PATH = MODEL_DIR / "confusion_matrix.json"

SEED = 42
VAL_RATIO = 0.15
BATCH_SIZE = 64
NUM_WORKERS = 2
EPOCHS_STAGE_1 = 3
EPOCHS_STAGE_2 = 12
LR_STAGE_1 = 1e-3
LR_STAGE_2 = 3e-4
WEIGHT_DECAY = 1e-4

DEVICE = (
    torch.device("mps")
    if torch.backends.mps.is_available()
    else torch.device("cuda")
    if torch.cuda.is_available()
    else torch.device("cpu")
)


@dataclass
class EpochMetrics:
    epoch: int
    train_loss: float
    train_acc: float
    val_loss: float
    val_acc: float
    val_precision_macro: float
    val_recall_macro: float
    val_f1_macro: float


def set_seed(seed: int = SEED) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def ensure_output_dir() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)


def build_transforms():
    train_transform = transforms.Compose(
        [
            transforms.RandomResizedCrop(224, scale=(0.75, 1.0)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(degrees=12),
            transforms.ColorJitter(
                brightness=0.20,
                contrast=0.20,
                saturation=0.15,
                hue=0.03,
            ),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )

    val_transform = transforms.Compose(
        [
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )

    return train_transform, val_transform


def load_base_dataset():
    if not DATA_DIR.exists():
        raise RuntimeError(f"Dataset directory not found: {DATA_DIR}")

    dataset = datasets.ImageFolder(str(DATA_DIR))
    if len(dataset) == 0:
        raise RuntimeError(f"No images found under: {DATA_DIR}")

    return dataset


def make_splits(dataset):
    targets = np.array(dataset.targets)
    indices = np.arange(len(dataset))

    train_idx, val_idx = train_test_split(
        indices,
        test_size=VAL_RATIO,
        random_state=SEED,
        stratify=targets,
    )

    return train_idx.tolist(), val_idx.tolist()


def build_datasets():
    train_transform, val_transform = build_transforms()

    base_dataset = load_base_dataset()
    train_idx, val_idx = make_splits(base_dataset)

    train_dataset = datasets.ImageFolder(str(DATA_DIR), transform=train_transform)
    val_dataset = datasets.ImageFolder(str(DATA_DIR), transform=val_transform)

    train_subset = Subset(train_dataset, train_idx)
    val_subset = Subset(val_dataset, val_idx)

    return base_dataset, train_subset, val_subset


def build_model(num_classes: int) -> nn.Module:
    try:
        weights = models.MobileNet_V2_Weights.DEFAULT
        model = models.mobilenet_v2(weights=weights)
    except Exception:
        model = models.mobilenet_v2(weights=None)

    model.classifier[1] = nn.Linear(model.last_channel, num_classes)
    return model


def set_backbone_trainable(model: nn.Module, train_backbone: bool) -> None:
    for param in model.features.parameters():
        param.requires_grad = train_backbone

    for param in model.classifier.parameters():
        param.requires_grad = True


def make_loader(dataset, shuffle: bool) -> DataLoader:
    return DataLoader(
        dataset,
        batch_size=BATCH_SIZE,
        shuffle=shuffle,
        num_workers=NUM_WORKERS,
        pin_memory=torch.cuda.is_available(),
    )


def calculate_class_weights(train_subset, num_classes: int) -> torch.Tensor:
    train_targets = [train_subset.dataset.targets[i] for i in train_subset.indices]
    classes = np.arange(num_classes)
    weights = compute_class_weight(
        class_weight="balanced",
        classes=classes,
        y=np.array(train_targets),
    )
    return torch.tensor(weights, dtype=torch.float32, device=DEVICE)


def train_one_epoch(model, loader, criterion, optimizer):
    model.train()
    running_loss = 0.0
    preds_all = []
    labels_all = []

    for images, labels in loader:
        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad(set_to_none=True)
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += float(loss.item()) * images.size(0)
        preds = torch.argmax(outputs, dim=1)

        preds_all.extend(preds.detach().cpu().tolist())
        labels_all.extend(labels.detach().cpu().tolist())

    avg_loss = running_loss / max(1, len(loader.dataset))
    acc = accuracy_score(labels_all, preds_all)
    return avg_loss, acc


@torch.no_grad()
def evaluate(model, loader, criterion):
    model.eval()
    running_loss = 0.0
    preds_all = []
    labels_all = []

    for images, labels in loader:
        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        outputs = model(images)
        loss = criterion(outputs, labels)

        running_loss += float(loss.item()) * images.size(0)
        preds = torch.argmax(outputs, dim=1)

        preds_all.extend(preds.detach().cpu().tolist())
        labels_all.extend(labels.detach().cpu().tolist())

    avg_loss = running_loss / max(1, len(loader.dataset))
    acc = accuracy_score(labels_all, preds_all)
    precision = precision_score(labels_all, preds_all, average="macro", zero_division=0)
    recall = recall_score(labels_all, preds_all, average="macro", zero_division=0)
    f1 = f1_score(labels_all, preds_all, average="macro", zero_division=0)

    return avg_loss, acc, precision, recall, f1, labels_all, preds_all


def save_artifacts(
    model: nn.Module,
    class_names: list[str],
    metrics: dict[str, Any],
    confusion: dict[str, Any],
) -> None:
    torch.save(model.state_dict(), MODEL_PATH)

    with open(CLASS_NAMES_PATH, "w", encoding="utf-8") as f:
        json.dump(class_names, f, indent=2)

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    with open(CONFUSION_PATH, "w", encoding="utf-8") as f:
        json.dump(confusion, f, indent=2)


def main():
    set_seed(SEED)
    ensure_output_dir()

    base_dataset, train_subset, val_subset = build_datasets()
    class_names = list(base_dataset.classes)
    num_classes = len(class_names)

    if num_classes < 2:
        raise RuntimeError("Need at least 2 classes to train the vision model.")

    print(f"Found {len(base_dataset)} images across {num_classes} classes.")
    print(f"Classes: {class_names}")

    train_loader = make_loader(train_subset, shuffle=True)
    val_loader = make_loader(val_subset, shuffle=False)

    class_weights = calculate_class_weights(train_subset, num_classes)
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    model = build_model(num_classes).to(DEVICE)

    history: list[EpochMetrics] = []
    best_state = None
    best_val_acc = -1.0
    best_epoch = -1

    # Stage 1: train classifier head only
    set_backbone_trainable(model, train_backbone=False)
    optimizer = torch.optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=LR_STAGE_1,
        weight_decay=WEIGHT_DECAY,
    )

    total_epochs = EPOCHS_STAGE_1 + EPOCHS_STAGE_2

    for epoch in range(1, total_epochs + 1):
        if epoch == EPOCHS_STAGE_1 + 1:
            set_backbone_trainable(model, train_backbone=True)
            optimizer = torch.optim.AdamW(
                model.parameters(),
                lr=LR_STAGE_2,
                weight_decay=WEIGHT_DECAY,
            )

        train_loss, train_acc = train_one_epoch(
            model,
            train_loader,
            criterion,
            optimizer,
        )

        val_loss, val_acc, precision, recall, f1, y_true, y_pred = evaluate(
            model,
            val_loader,
            criterion,
        )

        epoch_metrics = EpochMetrics(
            epoch=epoch,
            train_loss=round(train_loss, 6),
            train_acc=round(train_acc, 6),
            val_loss=round(val_loss, 6),
            val_acc=round(val_acc, 6),
            val_precision_macro=round(precision, 6),
            val_recall_macro=round(recall, 6),
            val_f1_macro=round(f1, 6),
        )
        history.append(epoch_metrics)

        print(
            f"Epoch {epoch:02d}/{total_epochs} | "
            f"train_loss={train_loss:.4f} train_acc={train_acc:.4f} | "
            f"val_loss={val_loss:.4f} val_acc={val_acc:.4f} "
            f"val_f1={f1:.4f}"
        )

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_epoch = epoch
            best_state = {
                k: v.detach().cpu().clone()
                for k, v in model.state_dict().items()
            }

    if best_state is None:
        raise RuntimeError("Training failed to produce a best model state.")

    model.load_state_dict(best_state)
    model.to("cpu")
    model.eval()

    final_val_loss, final_val_acc, final_precision, final_recall, final_f1, y_true, y_pred = evaluate(
        model.to(DEVICE),
        val_loader,
        criterion,
    )

    labels_sorted = list(range(num_classes))
    confusion = {
        "class_names": class_names,
        "support": Counter(y_true),
        "best_epoch": best_epoch,
        "best_val_accuracy": round(float(best_val_acc), 6),
        "final_val_accuracy": round(float(final_val_acc), 6),
        "final_val_loss": round(float(final_val_loss), 6),
    }

    metrics = {
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "device": str(DEVICE),
        "num_classes": num_classes,
        "num_images": len(base_dataset),
        "train_images": len(train_subset),
        "val_images": len(val_subset),
        "best_epoch": best_epoch,
        "best_val_accuracy": round(float(best_val_acc), 6),
        "final_val_accuracy": round(float(final_val_acc), 6),
        "final_val_loss": round(float(final_val_loss), 6),
        "final_precision_macro": round(float(final_precision), 6),
        "final_recall_macro": round(float(final_recall), 6),
        "final_f1_macro": round(float(final_f1), 6),
        "history": [asdict(m) for m in history],
    }

    save_artifacts(model, class_names, metrics, confusion)

    print(f"Saved model to {MODEL_PATH}")
    print(f"Saved class names to {CLASS_NAMES_PATH}")
    print(f"Saved metrics to {METRICS_PATH}")
    print(f"Best validation accuracy: {best_val_acc:.4f} at epoch {best_epoch}")


if __name__ == "__main__":
    main()