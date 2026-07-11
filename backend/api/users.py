from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.core.deps import admin_required
from backend.database.session import get_db
from backend.models.user import User
from backend.schemas.user import UserResponse, UserRoleUpdate
from backend.services.users_service import (
    list_users,
    get_user_by_id,
    update_user_role,
    set_user_active_status,
    delete_user,
)

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    return list_users(db)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    return get_user_by_id(
        db,
        user_id,
    )


@router.put("/{user_id}/role", response_model=UserResponse)
def change_role(
    user_id: int,
    data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    return update_user_role(
        db,
        user_id,
        data.role,
        current_user,
    )


@router.put("/{user_id}/activate", response_model=UserResponse)
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    return set_user_active_status(
        db,
        user_id,
        True,
        current_user,
    )


@router.put("/{user_id}/deactivate", response_model=UserResponse)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    return set_user_active_status(
        db,
        user_id,
        False,
        current_user,
    )


@router.delete("/{user_id}")
def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    return delete_user(
        db,
        user_id,
        current_user,
    )