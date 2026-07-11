from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.database.base import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_type = Column(String, nullable=False)  # DISTRIBUTOR_TO_SUPPLIER | RETAILER_TO_DISTRIBUTOR
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    distributor_id = Column(Integer, ForeignKey("distributors.id"), nullable=True)
    total_amount = Column(Float, default=0)
    status = Column(String, default="PENDING")
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    supplier = relationship("Supplier")
    distributor = relationship("Distributor")
    items = relationship("OrderItem", back_populates="order")