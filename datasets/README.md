# 📊 Datasets Directory

This directory contains the data catalogs, synthetic logs, and training sets utilized by **SelfStack** for machine learning, retail demand forecasting, inventory simulation, and shelf computer vision.

---

## 🗂️ Directory Architecture

```
datasets/
├── processed/
│   ├── products/
│   │   ├── products.csv              # Main retail product catalog (50 MB)
│   │   └── master_products.csv       # Master product database (34 MB)
│   ├── retail_product_yolo/          # YOLOv8 shelf detection dataset (16 MB)
│   │   ├── images/ (train, val)      # Bounding box annotated retail shelf items
│   │   ├── labels/ (train, val)      # YOLO normalized label coordinates
│   │   └── data.yaml                 # YOLO dataset configuration
│   ├── cleaned_products.csv          # Preprocessed product schema
│   ├── cleaned_sales.csv             # Cleaned historical sales schema
│   ├── features.csv                  # Engineered features schema for XGBoost
│   └── forecast_dataset.csv          # Autoregressive time series schema
├── synthetic/
│   ├── synthetic_inventory.csv       # Simulated multi-warehouse stock levels
│   ├── synthetic_orders.csv          # Simulated vendor purchase & customer orders
│   └── synthetic_sales.csv           # Daily simulated point-of-sale transactions
└── raw/
    ├── festivals/
    │   └── festival_calendar.csv     # Holiday & festival demand multiplier calendar
    ├── retail_sales/
    │   └── retail_sales_dataset.csv  # Baseline retail sales pattern data
    └── weather/
        └── weatherHistory.csv        # Historical weather data (temp, humidity, rain)
```

---

## 💾 Tracked vs. External Datasets

### ✅ Included in Repository
* **Processed Catalogs**: `products.csv` and `master_products.csv` (complete catalog with SKUs, prices, categories, and descriptions).
* **Vision Dataset**: `retail_product_yolo/` with full image samples and annotated labels across grocery categories (Aqua, Indomie, Chitato, Shampoo, Pepsodent, Tissue, etc.).
* **External Regressors**: `festival_calendar.csv` and `weatherHistory.csv` (used by `scripts/generate_synthetic_sales.py` and the XGBoost demand forecasting models).

### 🌐 Large Raw Datasets (Hosted Externally)
Raw archive dumps (~36 GB total) are excluded from Git to comply with GitHub's 100 MB per-file limit and repository size best practices:

| Dataset | Raw Size | Description | Source / Reference |
| :--- | :--- | :--- | :--- |
| **Walmart M5 Forecasting** | ~475 MB | Daily item unit sales at store-department level | [Kaggle M5 Forecasting - Accuracy](https://www.kaggle.com/c/m5-forecasting-accuracy) |
| **OpenFoodFacts Dump** | ~1.0 GB | Global open database of food products | [Open Food Facts Database](https://world.openfoodfacts.org/data) |
| **Amazon Berkeley Objects (ABO)** | ~2.7 GB | High-resolution e-commerce product imagery | [Amazon ABO Dataset](https://amazon-berkeley-objects.s3.amazonaws.com/index.html) |
| **Freiburg Grocery Dataset** | ~510 MB | 25 grocery categories for image classification | [Freiburg Groceries Dataset (GitHub)](https://github.com/PhilJd/freiburg_groceries_dataset) |
| **SKU-110K** | ~13 GB | Dense shelf object detection dataset | [SKU110K Dataset](https://github.com/eg4000/SKU110K_CVPR19) |

---

## 🛠️ Regenerating Data & Running Simulations

To generate synthetic transaction history with seasonal, festival, and weather adjustments:
```bash
python scripts/generate_synthetic_sales.py
```

To seed the local PostgreSQL database with catalog products and initial users:
```bash
python scripts/seed_database.py
```
