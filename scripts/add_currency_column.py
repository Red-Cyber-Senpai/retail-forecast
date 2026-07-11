from sqlalchemy import text

from backend.database.connection import engine

with engine.connect() as conn:
    conn.execute(text(
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';"
    ))
    conn.commit()

print("Added 'currency' column to products table (default 'INR'). Existing rows are untouched.")