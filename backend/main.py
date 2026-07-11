import os

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.connection import engine
from backend.database.base import Base

from backend.api.product import router as product_router
from backend.api.inventory import router as inventory_router
from backend.api.sale import router as sale_router
from backend.api.dashboard import router as dashboard_router
from backend.api.search import router as search_router
from backend.api.supplier import router as supplier_router
from backend.api.distributor import router as distributor_router
from backend.api.order import router as order_router
from backend.api.recognition import router as recognition_router
from backend.api.forecast import router as forecast_router
from backend.api import recommendation
from backend.api.barcode import router as barcode_router
from backend.api.analytics import router as analytics_router
from backend.api.supplier_intelligence import router as supplier_intelligence_router
from backend.api.procurement import router as procurement_router
from backend.api.auth import router as auth_router
from backend.api.users import router as users_router
from backend.api.inventory_intelligence import router as inventory_intelligence_router
from backend.api.reorder import router as reorder_router
from backend.api.alerts import router as alerts_router
from backend.api.insights import router as insights_router

import backend.models as models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SelfStack API",
    version="1.0.0",
)

app.include_router(product_router)
app.include_router(inventory_router)
app.include_router(sale_router)
app.include_router(dashboard_router)
app.include_router(search_router)
app.include_router(supplier_router)
app.include_router(distributor_router)
app.include_router(order_router)
app.include_router(recognition_router)
app.include_router(forecast_router)
app.include_router(recommendation.router)
app.include_router(barcode_router)
app.include_router(analytics_router)
app.include_router(supplier_intelligence_router)
app.include_router(procurement_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(inventory_intelligence_router)
app.include_router(reorder_router)
app.include_router(alerts_router)
app.include_router(insights_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "SelfStack Backend Running"}


@app.get("/health")
def health():
    return {"status": "healthy"}