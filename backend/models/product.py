from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Float, Integer, String
from sqlalchemy import Text
from sqlalchemy.sql import func
from sqlalchemy import DateTime

from backend.database.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(Text, nullable=False)
    brand = Column(Text)
    category = Column(Text)
    description = Column(String)
    image_url = Column(String)
    unit = Column(String(50), default="pcs")
    cost_price = Column(Float, default=0)
    selling_price = Column(Float, default=0)
    currency = Column(String(10), default="INR")
    
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    purchase_price = Column(Float, default=0)
    minimum_order_quantity = Column(Integer, default=1)
    
    supplier = relationship(
        "Supplier",
        back_populates="products"
    )
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())