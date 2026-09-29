from __future__ import annotations

import json
import shutil
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Iterable

import torch
from ultralytics import YOLO

import os

ROOT_DIR = Path(__file__).resolve().parents[1]

# Optional raw XML source directory for re-conversion; defaults to None
SOURCE_DATASET = Path(os.environ["RAW_YOLO_SOURCE"]) if "RAW_YOLO_SOURCE" in os.environ else None
SOURCE_IMAGES_TRAIN = SOURCE_DATASET / "images" / "train" if SOURCE_DATASET else None
SOURCE_IMAGES_VAL = SOURCE_DATASET / "images" / "test" if SOURCE_DATASET else None
SOURCE_ANN_TRAIN = SOURCE_DATASET / "annotations" / "train" if SOURCE_DATASET else None
SOURCE_ANN_VAL = SOURCE_DATASET / "annotations" / "test" if SOURCE_DATASET else None

PROCESSED_ROOT = ROOT_DIR / "datasets" / "processed" / "retail_product_yolo"
PROCESSED_IMAGES_TRAIN = PROCESSED_ROOT / "images" / "train"
PROCESSED_IMAGES_VAL = PROCESSED_ROOT / "images" / "val"
PROCESSED_LABELS_TRAIN = PROCESSED_ROOT / "labels" / "train"
PROCESSED_LABELS_VAL = PROCESSED_ROOT / "labels" / "val"
DATA_YAML_PATH = PROCESSED_ROOT / "data.yaml"

MODEL_DIR = ROOT_DIR / "models" / "vision"
YOLO_MODEL_OUT = MODEL_DIR / "yolo_shelf.pt"
METRICS_OUT = MODEL_DIR / "yolo_shelf_metrics.json"
CLASS_NAMES_OUT = MODEL_DIR / "yolo_shelf_class_names.json"

PRETRAINED_WEIGHTS = "yolov8n.pt"
EPOCHS = 80
IMG_SIZE = 640
BATCH = 8
PATIENCE = 15


def ensure_dirs() -> None:
    for path in [
        PROCESSED_IMAGES_TRAIN,
        PROCESSED_IMAGES_VAL,
        PROCESSED_LABELS_TRAIN,
        PROCESSED_LABELS_VAL,
        MODEL_DIR,
    ]:
        path.mkdir(parents=True, exist_ok=True)


def find_image_for_xml(xml_path: Path, images_dir: Path) -> Path | None:
    stem = xml_path.stem
    candidates = [
        images_dir / f"{stem}.jpg",
        images_dir / f"{stem}.jpeg",
        images_dir / f"{stem}.png",
        images_dir / f"{stem}.JPG",
        images_dir / f"{stem}.JPEG",
        images_dir / f"{stem}.PNG",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def parse_voc_xml(xml_path: Path) -> tuple[int, int, list[dict]]:
    tree = ET.parse(xml_path)
    root = tree.getroot()

    size = root.find("size")
    if size is None:
        raise RuntimeError(f"Missing <size> in {xml_path}")

    width_text = size.findtext("width")
    height_text = size.findtext("height")

    if not width_text or not height_text:
        raise RuntimeError(f"Missing image size in {xml_path}")

    width = int(float(width_text))
    height = int(float(height_text))

    objects: list[dict] = []
    for obj in root.findall("object"):
        name = obj.findtext("name")
        bndbox = obj.find("bndbox")
        if not name or bndbox is None:
            continue

        xmin = float(bndbox.findtext("xmin", default="0"))
        ymin = float(bndbox.findtext("ymin", default="0"))
        xmax = float(bndbox.findtext("xmax", default="0"))
        ymax = float(bndbox.findtext("ymax", default="0"))

        objects.append(
            {
                "name": name.strip(),
                "xmin": xmin,
                "ymin": ymin,
                "xmax": xmax,
                "ymax": ymax,
            }
        )

    return width, height, objects


def collect_class_names(xml_dirs: Iterable[Path]) -> list[str]:
    class_counter: Counter[str] = Counter()

    for xml_dir in xml_dirs:
        for xml_path in xml_dir.glob("*.xml"):
            try:
                _, _, objects = parse_voc_xml(xml_path)
            except Exception:
                continue

            for obj in objects:
                class_counter[obj["name"]] += 1

    if not class_counter:
        raise RuntimeError("No classes found in XML annotations.")

    class_names = sorted(class_counter.keys())

    print("Class distribution:")
    for name in class_names:
        print(f"  {name}: {class_counter[name]}")

    return class_names


def yolo_box(xmin: float, ymin: float, xmax: float, ymax: float, width: int, height: int):
    x_center = ((xmin + xmax) / 2.0) / width
    y_center = ((ymin + ymax) / 2.0) / height
    box_w = (xmax - xmin) / width
    box_h = (ymax - ymin) / height

    x_center = max(0.0, min(1.0, x_center))
    y_center = max(0.0, min(1.0, y_center))
    box_w = max(0.0, min(1.0, box_w))
    box_h = max(0.0, min(1.0, box_h))

    return x_center, y_center, box_w, box_h


def convert_split(
    split_name: str,
    xml_dir: Path,
    images_dir: Path,
    output_images_dir: Path,
    output_labels_dir: Path,
    class_to_idx: dict[str, int],
) -> dict[str, int]:
    copied_images = 0
    written_labels = 0
    skipped_missing_images = 0
    skipped_empty_annotations = 0

    for xml_path in sorted(xml_dir.glob("*.xml")):
        image_path = find_image_for_xml(xml_path, images_dir)
        if image_path is None:
            skipped_missing_images += 1
            continue

        try:
            width, height, objects = parse_voc_xml(xml_path)
        except Exception as exc:
            print(f"[WARN] Skipping malformed XML {xml_path.name}: {exc}")
            continue

        if not objects:
            skipped_empty_annotations += 1
            continue

        label_lines: list[str] = []
        for obj in objects:
            class_name = obj["name"]
            if class_name not in class_to_idx:
                continue

            cls_id = class_to_idx[class_name]
            x_center, y_center, box_w, box_h = yolo_box(
                obj["xmin"],
                obj["ymin"],
                obj["xmax"],
                obj["ymax"],
                width,
                height,
            )
            label_lines.append(
                f"{cls_id} {x_center:.6f} {y_center:.6f} {box_w:.6f} {box_h:.6f}"
            )

        if not label_lines:
            skipped_empty_annotations += 1
            continue

        shutil.copy2(image_path, output_images_dir / image_path.name)
        copied_images += 1

        label_path = output_labels_dir / f"{xml_path.stem}.txt"
        label_path.write_text("\n".join(label_lines) + "\n", encoding="utf-8")
        written_labels += 1

    print(
        f"[{split_name}] copied_images={copied_images}, "
        f"written_labels={written_labels}, "
        f"missing_images={skipped_missing_images}, "
        f"empty_annotations={skipped_empty_annotations}"
    )

    return {
        "copied_images": copied_images,
        "written_labels": written_labels,
        "missing_images": skipped_missing_images,
        "empty_annotations": skipped_empty_annotations,
    }


def write_data_yaml(class_names: list[str]) -> None:
    names_yaml = "\n".join([f"  {i}: {name}" for i, name in enumerate(class_names)])
    yaml_text = f"""path: {PROCESSED_ROOT.as_posix()}
train: images/train
val: images/val

names:
{names_yaml}
"""
    DATA_YAML_PATH.write_text(yaml_text, encoding="utf-8")


def clear_processed_dataset() -> None:
    if PROCESSED_ROOT.exists():
        shutil.rmtree(PROCESSED_ROOT)
    ensure_dirs()


def train_yolo() -> None:
    model = YOLO(PRETRAINED_WEIGHTS)

    if torch.backends.mps.is_available():
        device = "mps"
    elif torch.cuda.is_available():
        device = 0
    else:
        device = "cpu"

    print(f"\nTraining on device: {device}\n")

    results = model.train(
        data=str(DATA_YAML_PATH),
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH,
        patience=PATIENCE,
        project=str(MODEL_DIR / "runs"),
        name="retail_product_yolo",
        exist_ok=True,
        pretrained=True,
        device=device,
        verbose=True,
    )

    best_pt = Path(results.save_dir) / "weights" / "best.pt"
    if not best_pt.exists():
        raise RuntimeError(f"Training finished but best.pt was not found at {best_pt}")

    shutil.copy2(best_pt, YOLO_MODEL_OUT)

    try:
        metrics = model.val(
            data=str(DATA_YAML_PATH),
            split="val",
            imgsz=IMG_SIZE,
            device=device,
        )
        metrics_dict = {
            "map50": float(getattr(metrics.box, "map50", 0.0)),
            "map50_95": float(getattr(metrics.box, "map", 0.0)),
            "precision": float(getattr(metrics.box, "mp", 0.0)),
            "recall": float(getattr(metrics.box, "mr", 0.0)),
        }
    except Exception as exc:
        metrics_dict = {
            "note": f"Validation metrics unavailable: {exc}",
        }

    payload = {
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "processed_dataset": str(PROCESSED_ROOT),
        "model_path": str(YOLO_MODEL_OUT),
        "class_names_path": str(CLASS_NAMES_OUT),
        "data_yaml": str(DATA_YAML_PATH),
        "epochs": EPOCHS,
        "imgsz": IMG_SIZE,
        "batch": BATCH,
        "patience": PATIENCE,
        "metrics": metrics_dict,
    }
    if SOURCE_DATASET:
        payload["source_dataset"] = str(SOURCE_DATASET)

    METRICS_OUT.write_text(
        json.dumps(payload, indent=2),
        encoding="utf-8",
    )

    print(f"\nSaved YOLO model to {YOLO_MODEL_OUT}")
    print(f"Saved metrics to {METRICS_OUT}")


def main() -> None:
    ensure_dirs()

    if SOURCE_DATASET and SOURCE_DATASET.exists():
        print(f"Re-converting raw source dataset from {SOURCE_DATASET}...")
        clear_processed_dataset()

        class_names = collect_class_names([SOURCE_ANN_TRAIN, SOURCE_ANN_VAL])
        class_to_idx = {name: idx for idx, name in enumerate(class_names)}

        CLASS_NAMES_OUT.write_text(json.dumps(class_names, indent=2), encoding="utf-8")
        write_data_yaml(class_names)

        print(f"Using classes ({len(class_names)}): {class_names}")
        print(f"Wrote class list to {CLASS_NAMES_OUT}")
        print(f"Wrote YOLO dataset YAML to {DATA_YAML_PATH}")

        train_stats = convert_split(
            split_name="train",
            xml_dir=SOURCE_ANN_TRAIN,
            images_dir=SOURCE_IMAGES_TRAIN,
            output_images_dir=PROCESSED_IMAGES_TRAIN,
            output_labels_dir=PROCESSED_LABELS_TRAIN,
            class_to_idx=class_to_idx,
        )

        val_stats = convert_split(
            split_name="val",
            xml_dir=SOURCE_ANN_VAL,
            images_dir=SOURCE_IMAGES_VAL,
            output_images_dir=PROCESSED_IMAGES_VAL,
            output_labels_dir=PROCESSED_LABELS_VAL,
            class_to_idx=class_to_idx,
        )

        print("Conversion complete.")
        print(
            json.dumps(
                {
                    "train": train_stats,
                    "val": val_stats,
                },
                indent=2,
            )
        )
    elif DATA_YAML_PATH.exists():
        print(f"Using existing processed dataset at {PROCESSED_ROOT}")
        print(f"Data YAML: {DATA_YAML_PATH}")
    else:
        raise RuntimeError(
            f"Dataset configuration not found at {DATA_YAML_PATH}. "
            "Please ensure datasets/processed/retail_product_yolo is present."
        )

    train_yolo()


if __name__ == "__main__":
    main()