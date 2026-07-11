from sqlalchemy import Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from backend.database.base import Base


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price = Column(Float)

    product = relationship("Product")
    sale = relationship("Sale", back_populates="items")