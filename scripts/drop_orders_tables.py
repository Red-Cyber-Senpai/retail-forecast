from sqlalchemy import text

from backend.database.connection import engine

with engine.connect() as conn:
    conn.execute(text("DROP TABLE IF EXISTS order_items CASCADE;"))
    conn.execute(text("DROP TABLE IF EXISTS orders CASCADE;"))
    conn.commit()

print("Dropped orders and order_items tables. They will be recreated on next app startup.")