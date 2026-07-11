from pathlib import Path
import math
import pandas as pd
from sqlalchemy.exc import IntegrityError

from backend.database.session import SessionLocal
from backend.models.product import Product

# ----------------------------------------------------
# Configuration
# ----------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "datasets" / "processed" / "products" / "products.csv"

BATCH_SIZE = 1000


def clean(value, default=""):
    if value is None:
        return default

    if isinstance(value, float) and math.isnan(value):
        return default

    value = str(value).strip()

    if value.lower() == "nan":
        return default

    return value


print(f"Loading CSV from:\n{CSV_PATH}")

df = pd.read_csv(
    CSV_PATH,
    low_memory=False
)

# Remove duplicate barcodes
df = df.drop_duplicates(subset=["barcode"], keep="first")

print(f"Products after removing duplicates: {len(df)}")

db = SessionLocal()

try:

    for start in range(0, len(df), BATCH_SIZE):

        end = min(start + BATCH_SIZE, len(df))

        batch = []

        for _, row in df.iloc[start:end].iterrows():

            batch.append(
                Product(
                    barcode=clean(row.get("barcode")),
                    name=clean(row.get("name"), "Unknown Product"),
                    brand=clean(row.get("brand"), "Unknown"),
                    category=clean(row.get("category"), "Unknown"),
                    image_url=clean(row.get("image_url"), None),
                    unit="pcs",
                    cost_price=0,
                    selling_price=0,
                )
            )

        db.bulk_save_objects(batch)
        db.commit()

        print(f"Inserted {end:,}/{len(df):,}")

    print("\nDatabase seeded successfully!")

except IntegrityError as e:

    db.rollback()
    print("\nIntegrity Error")
    print(e)

except Exception as e:

    db.rollback()
    raise

finally:

    db.close()