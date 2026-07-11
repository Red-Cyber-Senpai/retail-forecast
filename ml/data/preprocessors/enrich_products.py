import pandas as pd
import numpy as np
from pathlib import Path

MASTER = Path("datasets/processed/products/master_products.csv")
OUT = Path("datasets/processed/products/products.csv")

df = pd.read_csv(MASTER)

# Rename columns
df = df.rename(columns={
    "code": "barcode",
    "product_name": "name",
    "categories_en": "category",
    "brands": "brand"
})

# Keep only products with names
df = df[df["name"].notna()]

# Clean strings
for col in ["name", "brand", "category"]:
    if col in df.columns:
        df[col] = df[col].fillna("Unknown").astype(str).str.strip()

# Generate IDs
df.insert(0, "product_id", range(1, len(df) + 1))

# Fake pricing (replace later with real data)
np.random.seed(42)
df["price"] = np.round(np.random.uniform(20, 500, len(df)), 2)

# Initial stock
df["stock"] = np.random.randint(5, 200, len(df))

# Reorder level
df["reorder_level"] = 20

# Supplier
suppliers = [
    "Local Distributor",
    "Metro Wholesale",
    "FreshFoods Ltd",
    "Global Retail Supply"
]

df["supplier"] = np.random.choice(suppliers, len(df))

# Status
df["status"] = "ACTIVE"

# Save
OUT.parent.mkdir(parents=True, exist_ok=True)
df.to_csv(OUT, index=False)

print(df.head())
print()
print("Rows:", len(df))
print("Saved:", OUT)