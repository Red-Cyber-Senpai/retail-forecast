from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from backend.database.base import Base


class InventoryLog(Base):
    __tablename__ = "inventory_logs"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    action = Column(String(30), nullable=False)

    quantity = Column(Integer, nullable=False)

    remarks = Column(String(255))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )