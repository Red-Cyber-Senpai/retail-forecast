from sqlalchemy import Column, Integer, String

from backend.database.base import Base


class Distributor(Base):
    __tablename__ = "distributors"

    id = Column(Integer, primary_key=True, index=True)

    company_name = Column(String)

    email = Column(String)

    phone = Column(String)

    region = Column(String)