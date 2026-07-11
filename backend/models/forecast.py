from sqlalchemy import Column, Integer, Float, Date

from backend.database.base import Base


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer)

    predicted_sales = Column(Float)

    confidence = Column(Float)

    forecast_date = Column(Date)