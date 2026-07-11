from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.database.base import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True)

    product_id = Column(Integer, ForeignKey("products.id"))

    quantity = Column(Integer, default=0)

    minimum_stock = Column(Integer, default=10)

    maximum_stock = Column(Integer, default=500)

    reorder_level = Column(Integer, default=20)

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    product = relationship("Product")