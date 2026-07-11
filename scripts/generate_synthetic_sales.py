import random
from datetime import date, datetime, timedelta

import pandas as pd

from backend.database.session import SessionLocal
from backend.models.product import Product
from backend.models.inventory import Inventory
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem

FESTIVAL_CSV = "datasets/raw/festivals/festival_calendar.csv"
WEATHER_CSV = "datasets/raw/weather/weatherHistory.csv"

DAYS_OF_HISTORY = 365 * 2

# Category baseline daily demand (units/day) and how much festivals/weather move them.
# These are rough, documented assumptions - not measured from real transactions.
CATEGORY_PROFILE = {
    "RICE": {"base": 12, "festival_boost": 1.4, "weekend_boost": 1.1, "heat_sensitivity": 0.0},
    "MILK": {"base": 25, "festival_boost": 1.2, "weekend_boost": 1.15, "heat_sensitivity": 0.05},
    "CHIPS": {"base": 18, "festival_boost": 1.5, "weekend_boost": 1.3, "heat_sensitivity": 0.1},
    "CHOCOLATE": {"base": 14, "festival_boost": 1.8, "weekend_boost": 1.25, "heat_sensitivity": -0.15},
    "COFFEE": {"base": 8, "festival_boost": 1.1, "weekend_boost": 1.05, "heat_sensitivity": -0.1},
    "TEA": {"base": 10, "festival_boost": 1.15, "weekend_boost": 1.05, "heat_sensitivity": -0.1},
    "SUGAR": {"base": 9, "festival_boost": 1.6, "weekend_boost": 1.1, "heat_sensitivity": 0.0},
    "FLOUR": {"base": 11, "festival_boost": 1.5, "weekend_boost": 1.1, "heat_sensitivity": 0.0},
    "PASTA": {"base": 10, "festival_boost": 1.2, "weekend_boost": 1.2, "heat_sensitivity": 0.0},
    "CEREAL": {"base": 7, "festival_boost": 1.1, "weekend_boost": 1.2, "heat_sensitivity": 0.0},
    "BEANS": {"base": 6, "festival_boost": 1.2, "weekend_boost": 1.05, "heat_sensitivity": 0.0},
    "NUTS": {"base": 8, "festival_boost": 1.9, "weekend_boost": 1.2, "heat_sensitivity": 0.0},
    "CANDY": {"base": 15, "festival_boost": 1.7, "weekend_boost": 1.3, "heat_sensitivity": 0.05},
    "CAKE": {"base": 6, "festival_boost": 2.0, "weekend_boost": 1.4, "heat_sensitivity": 0.0},
    "JUICE": {"base": 16, "festival_boost": 1.3, "weekend_boost": 1.2, "heat_sensitivity": 0.25},
    "SODA": {"base": 20, "festival_boost": 1.4, "weekend_boost": 1.3, "heat_sensitivity": 0.3},
    "WATER": {"base": 30, "festival_boost": 1.1, "weekend_boost": 1.1, "heat_sensitivity": 0.35},
    "OIL": {"base": 9, "festival_boost": 1.3, "weekend_boost": 1.05, "heat_sensitivity": 0.0},
    "HONEY": {"base": 4, "festival_boost": 1.3, "weekend_boost": 1.05, "heat_sensitivity": 0.0},
    "JAM": {"base": 5, "festival_boost": 1.2, "weekend_boost": 1.1, "heat_sensitivity": 0.0},
    "SPICES": {"base": 7, "festival_boost": 1.5, "weekend_boost": 1.05, "heat_sensitivity": 0.0},
    "VINEGAR": {"base": 4, "festival_boost": 1.1, "weekend_boost": 1.0, "heat_sensitivity": 0.0},
    "TOMATO_SAUCE": {"base": 8, "festival_boost": 1.2, "weekend_boost": 1.15, "heat_sensitivity": 0.0},
    "FISH": {"base": 5, "festival_boost": 1.1, "weekend_boost": 1.2, "heat_sensitivity": -0.1},
    "CORN": {"base": 6, "festival_boost": 1.2, "weekend_boost": 1.1, "heat_sensitivity": 0.1},
}
DEFAULT_PROFILE = {"base": 8, "festival_boost": 1.2, "weekend_boost": 1.1, "heat_sensitivity": 0.0}


def load_festival_month_days():
    """
    Returns a set of (month, day) tuples for festivals.
    NOTE: source data only covers 2026. We reuse month/day across all years
    in our synthetic range as an approximation - lunar-calendar festivals
    (Holi, Diwali, etc.) will drift in real years, but this keeps the right
    seasonal clustering for demo/forecasting purposes.
    """
    festival_month_days = set()
    with open(FESTIVAL_CSV, "r") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split(",")
            raw_date = parts[0].replace("--", "-")  # fix the malformed double-dash row
            try:
                d = datetime.strptime(raw_date, "%Y-%m-%d").date()
                festival_month_days.add((d.month, d.day))
            except ValueError:
                print(f"Skipping unparseable festival date: {parts[0]}")
    return festival_month_days


def load_climatological_temp_by_day_of_year():
    """
    Builds an average temperature per day-of-year (1-366) from the historical
    weather file, used as a PROXY seasonal signal only (source data is 2006-2016,
    a different region) - not literal historical fact for our store's dates.
    """
    print("Loading weather file for climatological averages (this file is large, may take a bit)...")
    df = pd.read_csv(WEATHER_CSV, usecols=["Formatted Date", "Temperature (C)"])
    df["Formatted Date"] = pd.to_datetime(df["Formatted Date"], utc=True, errors="coerce")
    df = df.dropna(subset=["Formatted Date"])
    df["day_of_year"] = df["Formatted Date"].dt.dayofyear
    daily_avg = df.groupby("day_of_year")["Temperature (C)"].mean()
    return daily_avg.to_dict()


def run():
    db = SessionLocal()

    print("Loading curated products (those with inventory rows)...")
    products = (
        db.query(Product)
        .join(Inventory, Inventory.product_id == Product.id)
        .all()
    )
    print(f"Generating history for {len(products)} products.")

    festival_month_days = load_festival_month_days()
    temp_by_day_of_year = load_climatological_temp_by_day_of_year()
    overall_avg_temp = sum(temp_by_day_of_year.values()) / len(temp_by_day_of_year)

    end_date = date.today()
    start_date = end_date - timedelta(days=DAYS_OF_HISTORY)

    print(f"Generating daily sales from {start_date} to {end_date}...")

    current_date = start_date
    total_sales_created = 0
    total_items_created = 0

    while current_date <= end_date:
        is_weekend = current_date.weekday() >= 5  # Sat/Sun
        is_festival = (current_date.month, current_date.day) in festival_month_days

        day_of_year = current_date.timetuple().tm_yday
        temp = temp_by_day_of_year.get(day_of_year, overall_avg_temp)
        # Normalize temperature deviation from the yearly average -> a -1..1-ish scale
        temp_deviation = (temp - overall_avg_temp) / 10.0

        sale = Sale(total_amount=0, created_at=datetime.combine(current_date, datetime.min.time()))
        db.add(sale)
        db.flush()

        day_total = 0.0
        items_to_add = []

        for product in products:
            profile = CATEGORY_PROFILE.get(product.category, DEFAULT_PROFILE)

            demand = profile["base"]
            if is_weekend:
                demand *= profile["weekend_boost"]
            if is_festival:
                demand *= profile["festival_boost"]
            demand *= (1 + profile["heat_sensitivity"] * temp_deviation)

            # Random day-to-day noise (Poisson keeps it non-negative, integer-like)
            demand = max(0, int(random.gauss(demand, demand * 0.25)))

            if demand <= 0:
                continue

            line_total = product.selling_price * demand
            day_total += line_total

            items_to_add.append(SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=demand,
                price=product.selling_price
            ))

        db.bulk_save_objects(items_to_add)
        sale.total_amount = day_total
        db.commit()

        total_sales_created += 1
        total_items_created += len(items_to_add)

        if total_sales_created % 100 == 0:
            print(f"  ...{total_sales_created} days generated ({current_date})")

        current_date += timedelta(days=1)

    print(f"\nDone. Created {total_sales_created} daily Sale records, {total_items_created} SaleItem rows.")
    db.close()


if __name__ == "__main__":
    run()