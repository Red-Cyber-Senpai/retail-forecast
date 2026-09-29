import random

from backend.database.session import SessionLocal
from backend.models.product import Product
from backend.models.inventory import Inventory

# Keyword -> Retail product category. Order matters: more specific keywords first
# where there's overlap (e.g. "tomato sauce" before generic "tomato").
CATEGORY_KEYWORDS = {
    "RICE": ["rice"],
    "MILK": ["milk"],
    "CHIPS": ["chips", "crisps"],
    "CHOCOLATE": ["chocolate", "cocoa"],
    "COFFEE": ["coffee"],
    "TEA": ["tea "],
    "SUGAR": ["sugar"],
    "FLOUR": ["flour", "atta"],
    "PASTA": ["pasta", "penne", "spaghetti", "macaroni"],
    "CEREAL": ["cereal", "granola", "muesli", "oats", "oat "],
    "BEANS": ["beans", "lentil", "adzuki"],
    "NUTS": ["nuts", "peanut", "almond", "cashew", "hazelnut", "walnut"],
    "CANDY": ["candy", "gummy", "sweet"],
    "CAKE": ["cake", "cookie", "biscuit"],
    "JUICE": ["juice"],
    "SODA": ["soda", "cola", "soft drink"],
    "WATER": ["water"],
    "OIL": ["oil"],
    "HONEY": ["honey"],
    "JAM": ["jam", "preserve", "marmalade"],
    "SPICES": ["spice", "pepper", "cinnamon", "cumin", "turmeric"],
    "VINEGAR": ["vinegar"],
    "TOMATO_SAUCE": ["tomato sauce", "ketchup", "marinara"],
    "FISH": ["fish", "tuna", "salmon", "sardine"],
    "CORN": ["corn", "maize", "polenta"],
}

# Rough realistic INR price ranges per category: (cost_price_range, markup_multiplier_range)
PRICE_RANGES = {
    "RICE": (40, 90), "MILK": (25, 60), "CHIPS": (15, 40), "CHOCOLATE": (20, 150),
    "COFFEE": (80, 300), "TEA": (60, 250), "SUGAR": (35, 55), "FLOUR": (30, 60),
    "PASTA": (40, 100), "CEREAL": (100, 350), "BEANS": (60, 130), "NUTS": (150, 600),
    "CANDY": (10, 60), "CAKE": (40, 200), "JUICE": (30, 90), "SODA": (25, 50),
    "WATER": (10, 25), "OIL": (100, 250), "HONEY": (120, 400), "JAM": (60, 180),
    "SPICES": (30, 150), "VINEGAR": (40, 90), "TOMATO_SAUCE": (50, 120),
    "FISH": (80, 300), "CORN": (30, 70),
}

TARGET_PER_CATEGORY = 8  # ~8 products per category * 24 categories ≈ 192 products
STARTING_STOCK_RANGE = (50, 200)


def categorize(name: str):
    name_lower = name.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in name_lower:
                return category
    return None


def run():
    db = SessionLocal()

    print("Scanning products and matching categories (this may take a moment for 338K rows)...")
    all_products = db.query(Product.id, Product.name).all()
    print(f"Scanned {len(all_products)} products.")

    matches_by_category = {cat: [] for cat in CATEGORY_KEYWORDS.keys()}
    for product_id, name in all_products:
        if not name:
            continue
        cat = categorize(name)
        if cat:
            matches_by_category[cat].append((product_id, name))

    curated_ids = []
    for cat, matches in matches_by_category.items():
        print(f"{cat}: found {len(matches)} candidates")
        if not matches:
            continue
        sample_size = min(TARGET_PER_CATEGORY, len(matches))
        sampled = random.sample(matches, sample_size)
        curated_ids.extend([(pid, cat) for pid, _ in sampled])

    print(f"\nCurated {len(curated_ids)} products total. Updating category/price and creating inventory...")

    for product_id, category in curated_ids:
        product = db.query(Product).filter(Product.id == product_id).first()
        if product is None:
            continue

        low, high = PRICE_RANGES.get(category, (20, 100))
        cost_price = round(random.uniform(low, high), 2)
        markup = random.uniform(1.15, 1.45)  # 15-45% markup
        selling_price = round(cost_price * markup, 2)

        product.category = category
        product.cost_price = cost_price
        product.selling_price = selling_price
        product.currency = "INR"

        existing_inventory = (
            db.query(Inventory)
            .filter(Inventory.product_id == product_id)
            .first()
        )
        if existing_inventory is None:
            starting_qty = random.randint(*STARTING_STOCK_RANGE)
            inventory = Inventory(
                product_id=product_id,
                quantity=starting_qty,
                minimum_stock=int(starting_qty * 0.15),
                maximum_stock=int(starting_qty * 2.5),
                reorder_level=int(starting_qty * 0.25),
            )
            db.add(inventory)

    db.commit()
    print(f"\nDone. {len(curated_ids)} products curated into the active store catalog with inventory.")

    db.close()


if __name__ == "__main__":
    run()