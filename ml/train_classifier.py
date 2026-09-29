import copy
import json
import os
import random
import time
from collections import defaultdict
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset, WeightedRandomSampler
from torchvision import datasets, models, transforms

# ---- Config ----
DATA_DIR = os.environ.get("VISION_DATA_DIR", "")
OUTPUT_MODEL_PATH = "models/vision/product_classifier.pt"
OUTPUT_CLASSES_PATH = "models/vision/class_names.json"
OUTPUT_METRICS_PATH = "models/vision/classifier_metrics.json"

SEED = 42
BATCH_SIZE = 32
VAL_SPLIT = 0.15

WARMUP_EPOCHS = 4
FINETUNE_EPOCHS = 24
WARMUP_LR = 1e-3
HEAD_LR = 3e-4
BACKBONE_LR = 1e-4
WEIGHT_DECAY = 1e-4
PATIENCE = 6
MIN_DELTA = 1e-4

UNFREEZE_LAST_N_BLOCKS = 3  # fine-tune the last N MobileNetV2 feature blocks

# ---- Reproducibility ----
random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)

# ---- Device ----
if torch.backends.mps.is_available():
    device = torch.device("mps")
elif torch.cuda.is_available():
    device = torch.device("cuda")
else:
    device = torch.device("cpu")

print(f"Using device: {device}")

# ---- Data transforms ----
train_transform = transforms.Compose(
    [
        transforms.RandomResizedCrop(224, scale=(0.75, 1.0), ratio=(0.85, 1.15)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(18),
        transforms.ColorJitter(
            brightness=0.2,
            contrast=0.2,
            saturation=0.18,
            hue=0.04,
        ),
        transforms.RandomAutocontrast(p=0.2),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
        transforms.RandomErasing(
            p=0.25,
            scale=(0.02, 0.12),
            ratio=(0.3, 3.3),
            value="random",
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


def stratified_split_indices(samples, val_split=0.15, seed=42):
    rng = random.Random(seed)
    label_to_indices = defaultdict(list)

    for idx, (_, label) in enumerate(samples):
        label_to_indices[label].append(idx)

    train_indices = []
    val_indices = []

    for _, indices in label_to_indices.items():
        rng.shuffle(indices)

        if len(indices) == 1:
            train_indices.extend(indices)
            continue

        val_count = max(1, int(round(len(indices) * val_split)))
        val_count = min(val_count, len(indices) - 1)

        val_indices.extend(indices[:val_count])
        train_indices.extend(indices[val_count:])

    rng.shuffle(train_indices)
    rng.shuffle(val_indices)

    return train_indices, val_indices


def build_weighted_sampler(sample_indices, samples, class_counts):
    sample_weights = []
    for idx in sample_indices:
        _, label = samples[idx]
        count = max(1, class_counts[label])
        sample_weights.append(1.0 / float(count))

    return WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True,
    )


def set_trainable_layers(model, unfreeze_last_n_blocks=3):
    for param in model.features.parameters():
        param.requires_grad = False

    for param in model.classifier.parameters():
        param.requires_grad = True

    total_blocks = len(model.features)
    start_idx = max(0, total_blocks - unfreeze_last_n_blocks)

    for i in range(start_idx, total_blocks):
        for param in model.features[i].parameters():
            param.requires_grad = True


def get_topk_accuracy(logits, labels, k=3):
    if logits.size(1) < k:
        k = logits.size(1)
    topk = logits.topk(k, dim=1).indices
    correct = topk.eq(labels.unsqueeze(1)).any(dim=1).float().sum().item()
    return correct / max(1, labels.size(0))


def run_epoch(model, loader, criterion, train=True):
    if train:
        model.train()
    else:
        model.eval()

    total_loss = 0.0
    total_correct = 0
    total_top3 = 0.0
    total_samples = 0

    context = torch.enable_grad() if train else torch.no_grad()
    with context:
        for images, labels in loader:
            images = images.to(device, non_blocking=True)
            labels = labels.to(device, non_blocking=True)

            if train:
                optimizer.zero_grad(set_to_none=True)

            outputs = model(images)
            loss = criterion(outputs, labels)

            if train:
                loss.backward()
                torch.nn.utils.clip_grad_norm_(
                    [p for p in model.parameters() if p.requires_grad],
                    max_norm=1.0,
                )
                optimizer.step()

            batch_size = labels.size(0)
            total_loss += loss.item() * batch_size

            preds = torch.argmax(outputs, dim=1)
            total_correct += (preds == labels).sum().item()
            total_top3 += get_topk_accuracy(outputs, labels, k=3) * batch_size
            total_samples += batch_size

    avg_loss = total_loss / max(1, total_samples)
    avg_acc = total_correct / max(1, total_samples)
    avg_top3 = total_top3 / max(1, total_samples)
    return avg_loss, avg_acc, avg_top3


def train_stage(
    model,
    train_loader,
    val_loader,
    criterion,
    optimizer_factory,
    epochs,
    patience,
    min_delta,
    stage_name,
):
    global optimizer

    optimizer = optimizer_factory(model)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode="min",
        factor=0.5,
        patience=2,
    )

    best_state = copy.deepcopy(model.state_dict())
    best_val_loss = float("inf")
    best_val_acc = 0.0
    best_val_top3 = 0.0
    epochs_no_improve = 0

    print(f"\n--- {stage_name} ---")

    for epoch in range(1, epochs + 1):
        start = time.time()

        train_loss, train_acc, train_top3 = run_epoch(
            model,
            train_loader,
            criterion,
            train=True,
        )
        val_loss, val_acc, val_top3 = run_epoch(
            model,
            val_loader,
            criterion,
            train=False,
        )

        scheduler.step(val_loss)
        elapsed = time.time() - start

        current_lr = optimizer.param_groups[0]["lr"]

        print(
            f"{stage_name} | Epoch {epoch}/{epochs} "
            f"| train_loss={train_loss:.4f} train_acc={train_acc:.3f} train_top3={train_top3:.3f} "
            f"| val_loss={val_loss:.4f} val_acc={val_acc:.3f} val_top3={val_top3:.3f} "
            f"| lr={current_lr:.6f} | {elapsed:.1f}s"
        )

        improved = val_loss < (best_val_loss - min_delta)
        if improved:
            best_val_loss = val_loss
            best_val_acc = val_acc
            best_val_top3 = val_top3
            best_state = copy.deepcopy(model.state_dict())
            epochs_no_improve = 0
            print(f"  -> New best model saved ({stage_name}, val_acc={val_acc:.3f})")
        else:
            epochs_no_improve += 1

        if epochs_no_improve >= patience:
            print(f"  -> Early stopping triggered in {stage_name}")
            break

    model.load_state_dict(best_state)

    return {
        "best_val_loss": best_val_loss,
        "best_val_acc": best_val_acc,
        "best_val_top3": best_val_top3,
        "epochs_ran": epoch,
    }


if __name__ == "__main__":
    os.makedirs(os.path.dirname(OUTPUT_MODEL_PATH), exist_ok=True)

    if not os.path.exists(DATA_DIR):
        if os.path.exists(OUTPUT_MODEL_PATH) and os.path.exists(OUTPUT_CLASSES_PATH):
            print(
                f"[INFO] Raw image training directory '{DATA_DIR}' not found.\n"
                f"[INFO] Serialized classifier artifacts are already available:\n"
                f"       - Model: {OUTPUT_MODEL_PATH}\n"
                f"       - Classes: {OUTPUT_CLASSES_PATH}\n"
                f"       - Metrics: {OUTPUT_METRICS_PATH}\n"
                f"[INFO] The application will use the pre-trained weights directly."
            )
            exit(0)
        raise FileNotFoundError(
            f"Image dataset directory not found: '{DATA_DIR}'. "
            "Please specify a valid dataset directory via the VISION_DATA_DIR environment variable."
        )

    # Load dataset once for labels / split
    full_dataset = datasets.ImageFolder(DATA_DIR)
    class_names = full_dataset.classes
    num_classes = len(class_names)

    if num_classes < 2:
        raise RuntimeError("Need at least 2 classes to train the classifier.")

    print(f"Found {num_classes} classes: {class_names}")
    print(f"Total images: {len(full_dataset)}")

    # Build stratified split
    train_indices, val_indices = stratified_split_indices(
        full_dataset.samples,
        val_split=VAL_SPLIT,
        seed=SEED,
    )

    # Class counts for weighting
    class_counts = [0] * num_classes
    for _, label in full_dataset.samples:
        class_counts[label] += 1
    print(f"Class counts: {dict(zip(class_names, class_counts))}")

    # Separate datasets with proper transforms
    train_dataset_full = datasets.ImageFolder(DATA_DIR, transform=train_transform)
    val_dataset_full = datasets.ImageFolder(DATA_DIR, transform=val_transform)

    train_dataset = Subset(train_dataset_full, train_indices)
    val_dataset = Subset(val_dataset_full, val_indices)

    sampler = build_weighted_sampler(
        train_indices,
        full_dataset.samples,
        class_counts,
    )

    pin_memory = device.type == "cuda"

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        sampler=sampler,
        num_workers=0,
        pin_memory=pin_memory,
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=0,
        pin_memory=pin_memory,
    )

    # Model
    model = models.mobilenet_v2(
        weights=models.MobileNet_V2_Weights.IMAGENET1K_V1
    )

    model.classifier[1] = nn.Linear(model.last_channel, num_classes)
    model = model.to(device)

    # Class weighting
    class_weights = torch.tensor(
        [
            len(full_dataset) / (num_classes * max(1, count))
            for count in class_counts
        ],
        dtype=torch.float32,
        device=device,
    )

    criterion = nn.CrossEntropyLoss(
        weight=class_weights,
        label_smoothing=0.05,
    )

    # -----------------------------
    # Stage 1: classifier warm-up
    # -----------------------------
    for param in model.features.parameters():
        param.requires_grad = False
    for param in model.classifier.parameters():
        param.requires_grad = True

    def warmup_optimizer_factory(m):
        return torch.optim.AdamW(
            [p for p in m.classifier.parameters() if p.requires_grad],
            lr=WARMUP_LR,
            weight_decay=WEIGHT_DECAY,
        )

    warmup_result = train_stage(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        criterion=criterion,
        optimizer_factory=warmup_optimizer_factory,
        epochs=WARMUP_EPOCHS,
        patience=max(2, PATIENCE // 2),
        min_delta=MIN_DELTA,
        stage_name="Warmup",
    )

    # -----------------------------
    # Stage 2: fine-tune backbone
    # -----------------------------
    set_trainable_layers(model, UNFREEZE_LAST_N_BLOCKS)

    def finetune_optimizer_factory(m):
        head_params = [p for p in m.classifier.parameters() if p.requires_grad]
        backbone_params = [
            p for p in m.features.parameters() if p.requires_grad
        ]

        param_groups = []
        if head_params:
            param_groups.append(
                {
                    "params": head_params,
                    "lr": HEAD_LR,
                }
            )
        if backbone_params:
            param_groups.append(
                {
                    "params": backbone_params,
                    "lr": BACKBONE_LR,
                }
            )

        return torch.optim.AdamW(
            param_groups,
            weight_decay=WEIGHT_DECAY,
        )

    finetune_result = train_stage(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        criterion=criterion,
        optimizer_factory=finetune_optimizer_factory,
        epochs=FINETUNE_EPOCHS,
        patience=PATIENCE,
        min_delta=MIN_DELTA,
        stage_name="FineTune",
    )

    # Save best final weights
    torch.save(model.state_dict(), OUTPUT_MODEL_PATH)

    with open(OUTPUT_CLASSES_PATH, "w", encoding="utf-8") as f:
        json.dump(class_names, f, indent=2)

    metrics = {
        "device": str(device),
        "num_classes": num_classes,
        "class_counts": dict(zip(class_names, class_counts)),
        "train_rows": len(train_indices),
        "val_rows": len(val_indices),
        "warmup": warmup_result,
        "finetune": finetune_result,
        "best_val_acc": finetune_result["best_val_acc"],
        "best_val_top3": finetune_result["best_val_top3"],
        "unfreeze_last_n_blocks": UNFREEZE_LAST_N_BLOCKS,
        "batch_size": BATCH_SIZE,
        "val_split": VAL_SPLIT,
        "warmup_epochs": WARMUP_EPOCHS,
        "finetune_epochs": FINETUNE_EPOCHS,
        "head_lr": HEAD_LR,
        "backbone_lr": BACKBONE_LR,
    }

    with open(OUTPUT_METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nDone. Best val accuracy: {finetune_result['best_val_acc']:.3f}")
    print(f"Best val top-3 accuracy: {finetune_result['best_val_top3']:.3f}")
    print(f"Saved model to {OUTPUT_MODEL_PATH}")
    print(f"Saved class names to {OUTPUT_CLASSES_PATH}")
    print(f"Saved metrics to {OUTPUT_METRICS_PATH}")