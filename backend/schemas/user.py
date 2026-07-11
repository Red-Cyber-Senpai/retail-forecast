from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, EmailStr


UserRole = Literal["employee", "manager", "admin", "superadmin"]


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRoleUpdate(BaseModel):
    role: UserRole


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True