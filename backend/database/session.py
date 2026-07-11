from sqlalchemy.orm import sessionmaker
from backend.database.connection import engine

SessionLocal = sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()