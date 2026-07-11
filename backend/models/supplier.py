from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from backend.database.base import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)

    company_name = Column(String, nullable=False)
    contact_person = Column(String)
    email = Column(String)
    phone = Column(String)

    address = Column(String)
    city = Column(String)
    state = Column(String)
    country = Column(String)

    lead_time_days = Column(Integer, default=7)
    rating = Column(Integer, default=5)

    products = relationship(
    "Product",
    back_populates="supplier"
    )