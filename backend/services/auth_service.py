from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from backend.models.user import User
from backend.schemas.user import UserCreate


def register_user(
    db: Session,
    user: UserCreate,
):
    existing = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    db_user = User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=hash_password(user.password),
        phone=user.phone,
        role="employee",
        is_active=True,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def login_user(
    db: Session,
    email: str,
    password: str,
):
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    if not verify_password(
        password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role,
            "email": user.email,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }