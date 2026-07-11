from sqlalchemy import Column, DateTime, Float, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.database.base import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    total_amount = Column(Float, default=0)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    items = relationship("SaleItem", back_populates="sale")