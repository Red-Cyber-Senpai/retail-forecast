import pandas as pd
from pathlib import Path

RAW = Path("datasets/raw/openfoodfacts/en.openfoodfacts.org.products.tsv")
OUT = Path("datasets/processed/products/master_products.csv")

OUT.parent.mkdir(parents=True, exist_ok=True)

cols = [
    "code",
    "product_name",
    "brands",
    "categories_en",
    "quantity",
    "image_url"
]

df = pd.read_csv(
    RAW,
    sep="\t",
    usecols=cols,
    low_memory=False
)

df = df.dropna(subset=["product_name"])

df = df.drop_duplicates(subset=["code"])

df.to_csv(OUT, index=False)

print(df.head())

print()

print("Saved:", OUT)
print("Products:", len(df))