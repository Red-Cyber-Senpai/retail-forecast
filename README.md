# SelfStack: AI-Powered Retail Inventory & Supply Chain Automation

SelfStack is a modern, end-to-end retail intelligence and supply chain automation platform designed to minimize inventory stockouts, eliminate supply chains bottlenecks, and optimize retail operations. By bridging the gap between computer vision on store shelves and predictive forecasting on daily transactions, SelfStack enables retailers to make data-driven decisions in real time.

---

## 🌟 Project Ideology

In traditional retail, stock replenishment is either purely reactive or relies on manual visual checks. This leads to two critical operational issues:
1. **Stockouts**: Lost revenue because high-demand products are sold out.
2. **Overstocking**: Tied-up capital and physical waste due to slow-moving items expiring or consuming shelf space.

**SelfStack's Philosophy** is to provide an integrated, lightweight, and local-first AI system that:
* **Sees the Shelf**: Decodes product barcodes and labels to track what is currently present on retail shelves.
* **Forecasts the Future**: Uses gradient-boosted autoregressive models to predict consumer demand for the next 7 to 30 days, incorporating external variables like regional holiday surges and weather patterns.
* **Optimizes the Chain**: Generates automated reorder suggestions, ranks regional distributors by performance, and creates procurement orders with a single click.

---

## 🛠 Technology Stack

### Backend
* **FastAPI**: High-performance, asynchronous REST API layer.
* **SQLAlchemy**: Object-Relational Mapper (ORM) for relational database communication.
* **PostgreSQL**: Production-grade relational database storing user roles, products, inventory records, and sales history.
* **Pydantic**: Robust data validation and settings management.

### Frontend
* **Vite + React 18**: Ultra-fast single-page application framework.
* **TailwindCSS v4**: Modern, customizable utility-first CSS styling.
* **Recharts**: Responsive SVG charting library for demand curves, inventory breakdowns, and revenue graphs.
* **Axios**: HTTP client with request interceptors to automatically forward JWT authentication tokens.

### Machine Learning & Vision
* **PyTorch (Torchvision)**: Deep learning framework for category classification.
* **XGBoost**: Extreme gradient boosting regressor for demand forecasting.
* **Scikit-Learn**: Machine learning utilities (scalers, encoders, and metrics).
* **OpenCV + pyzbar**: Image preprocessors and barcode decoder.

---

## 🧠 AI/ML Models & Accuracy Metrics

### 1. Demand Forecasting Regressor (XGBoost)
* **Algorithm**: Autoregressive XGBRegressor (`models/forecast/xgboost.pkl`).
* **Feature Pipeline**:
  * *Autoregressive Lags*: Lags (1, 3, 7) of daily unit sales.
  * *Rolling Statistics*: 7-day rolling sales mean and standard deviation.
  * *Temporal Features*: Day of the week, month, is_weekend, and festival calendar flags.
  * *Environmental Features*: Climatological daily average temperature proxy (to model seasonal beverage and snack sales).
* **Performance Metrics (`models/forecast/metrics.json`)**:
  * **Validation MAE**: **2.548** (Baseline MAE: **3.721**) — *31.5% better than naive baseline*
  * **Validation RMSE**: **4.027** (Baseline RMSE: **5.782**) — *30.4% better than baseline*
  * **Validation MAPE**: **28.19%** (Baseline MAPE: **37.77%**)
  * **R² Score**: **0.8209** (Explains 82.09% of daily sales variance)
  * **Validation Size**: 11,418 sales records

### 2. Product Image Category Classifier (MobileNetV2)
* **Algorithm**: Fine-tuned PyTorch MobileNetV2 with pre-trained ImageNet weights (`models/vision/product_classifier.pt`).
* **Performance Metrics (`models/vision/classifier_metrics.json`)**:
  * **Validation Accuracy**: **93.52%**
  * **Top-3 Validation Accuracy**: **93.52%**
  * **Class Capacity**: 25 custom grocery categories (e.g. Beans, Chips, Milk, Soda, Honey, Vinegar, Water, Spices, Tomato Sauce).
  * **Fine-Tuning Strategy**: Frozen early layers, unfreezing and training the last 3 feature blocks of MobileNetV2 to handle grocery package packaging differences.

---

## 📁 Repository Structure

```
├── backend/                  # FastAPI Application
│   ├── ai/                   # Inference engines (forecast, vision, barcode)
│   ├── api/                  # REST Endpoint routes
│   ├── core/                 # Configs, Security, and JWT auth dependencies
│   ├── database/             # Connection pooling and Session management
│   ├── models/               # SQLAlchemy ORM database models
│   ├── schemas/              # Pydantic validation schemas
│   ├── services/             # Business transactions and core workflows
│   └── main.py               # Application entrypoint
├── frontend/                 # Vite + React Client
│   ├── src/
│   │   ├── components/       # Domain-specific UI elements (tables, charts, modals)
│   │   ├── context/          # Global Authentication contexts
│   │   ├── hooks/            # Custom React hooks (auth)
│   │   ├── pages/            # View pages (Dashboard, Inventory, Forecast, Scanner)
│   │   ├── routes/           # Routing configuration & protected paths
│   │   └── services/         # Axios API service clients
│   └── package.json          # Frontend packages
├── ml/                       # Model Training Pipeline
│   ├── data/                 # Data loaders, cleaners, and feature engineering
│   ├── notebooks/            # Exploratory Data Analysis & training tests
│   ├── train_classifier.py   # Vision model training script
│   └── train_forecast.py     # Forecasting model training script
├── models/                   # Serialized Weights & Pickles
│   ├── forecast/             # xgboost.pkl, metrics.json, features mapper
│   ├── vision/               # product_classifier.pt, class_names.json
│   └── embeddings/           # faiss.index, product_embeddings.npy
├── datasets/                 # Local Data Directories
│   ├── processed/            # Cleaned files (products, sales, forecast)
│   └── synthetic/            # Synthetic sales logs
└── scripts/                  # DB Seeding & Testing Utilities
    ├── seed_database.py      # Seeds catalog and initial users
    ├── run_audit_tests.py    # Integration test suite for backend API
    └── generate_sales.py     # Generates daily POS transactions
```

---

## ⚡ Setup & Installation

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template and set credentials:
   ```bash
   cp .env.example .env
   # Update DATABASE_URL with your PostgreSQL credentials
   ```
5. Seed the database with catalog products and daily sales logs:
   ```bash
   python ../scripts/seed_database.py
   python ../scripts/generate_sales.py
   ```
6. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```

---

## 🛡 Security & Authentication
SelfStack implements robust security filters:
* **JWT Bearer Token Authentication**: Secures all dashboard, inventory, and forecasting routes.
* **Role-Based Access Control (RBAC)**: Users are divided into roles:
  * `employee` (Default): Can view inventory records and register sales.
  * `manager`: Can add products to the catalog and update stock levels.
  * `admin` / `superadmin`: Can manage users, adjust database records, and delete suppliers or products.

---

## 🗺 Strategic Roadmap
1. **Shelves Multi-Object Detection (YOLO)**: Migrate the vision module from single-image classification (MobileNetV2) to real-time object detection (YOLOv8/v11) to count dozens of products on a shelf in a single frame.
2. **FAISS Semantic Search Integration**: Connect the pre-built `models/embeddings/faiss.index` to replace simple SQL pattern matching with vector-based semantic search (matching queries like "cola" with "soft drinks").
3. **Receipt & Invoice OCR (Gemini API)**: Integrate Gemini 2.5 Flash to automatically parse paper invoices and generate stock-in inventory logs.
4. **Neural Time Series Modeling**: Explore deep learning time series models (like Temporal Fusion Transformers) to improve prediction accuracy over 30+ day horizons.
