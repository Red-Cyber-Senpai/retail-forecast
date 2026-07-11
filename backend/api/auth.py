from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.models.user import User
from backend.schemas.auth import Token
from backend.schemas.user import UserCreate, UserLogin, UserResponse
from backend.services.auth_service import register_user, login_user
from backend.core.deps import get_current_active_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/register", response_model=UserResponse)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    return register_user(db, user)


@router.post("/login", response_model=Token)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db),
):
    return login_user(db, credentials.email, credentials.password)


@router.post("/token", response_model=Token)
def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    return login_user(db, form_data.username, form_data.password)


@router.get("/me", response_model=UserResponse)
def me(
    current_user: User = Depends(get_current_active_user),
):
    return current_user