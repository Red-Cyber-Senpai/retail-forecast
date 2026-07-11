from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models.user import User


ALLOWED_ROLES = {
    "employee",
    "manager",
    "admin",
    "superadmin",
}


ROLE_PRIORITY = {
    "employee": 1,
    "manager": 2,
    "admin": 3,
    "superadmin": 4,
}


def list_users(db: Session):
    return (
        db.query(User)
        .order_by(User.id.desc())
        .all()
    )


def get_user_by_id(
    db: Session,
    user_id: int,
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user


def _normalize_role(role: str) -> str:
    return (role or "").strip().lower()


def _can_assign_role(
    actor_role: str,
    target_role: str,
):
    actor_role = _normalize_role(actor_role)
    target_role = _normalize_role(target_role)

    if actor_role == "superadmin":
        return True

    if actor_role == "admin":
        return target_role in {
            "employee",
            "manager",
        }

    return False


def _ensure_last_superadmin(
    db: Session,
    user: User,
):
    """
    Prevent removing or demoting the final superadmin.
    """

    if user.role != "superadmin":
        return

    total_superadmins = (
        db.query(User)
        .filter(User.role == "superadmin")
        .count()
    )

    if total_superadmins <= 1:
        raise HTTPException(
            status_code=400,
            detail="Cannot modify the last SuperAdmin.",
        )


def update_user_role(
    db: Session,
    user_id: int,
    role: str,
    actor: User,
):
    target_user = get_user_by_id(
        db,
        user_id,
    )

    normalized_role = _normalize_role(role)

    if normalized_role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=400,
            detail="Invalid role",
        )

    if actor.id == target_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot change your own role.",
        )

    if not _can_assign_role(
        actor.role,
        normalized_role,
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to assign this role.",
        )

    if (
        target_user.role == "superadmin"
        and normalized_role != "superadmin"
    ):
        _ensure_last_superadmin(
            db,
            target_user,
        )

    target_user.role = normalized_role

    db.commit()
    db.refresh(target_user)

    return target_user


def set_user_active_status(
    db: Session,
    user_id: int,
    is_active: bool,
    actor: User,
):
    target_user = get_user_by_id(
        db,
        user_id,
    )

    if actor.id == target_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot change your own status.",
        )

    if (
        target_user.role == "superadmin"
        and not is_active
    ):
        _ensure_last_superadmin(
            db,
            target_user,
        )

    target_user.is_active = is_active

    db.commit()
    db.refresh(target_user)

    return target_user


def delete_user(
    db: Session,
    user_id: int,
    actor: User,
):
    target_user = get_user_by_id(
        db,
        user_id,
    )

    if actor.id == target_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account.",
        )

    if ROLE_PRIORITY[target_user.role] > ROLE_PRIORITY[actor.role]:
        raise HTTPException(
            status_code=403,
            detail="You cannot delete a higher privileged user.",
        )

    if (
        target_user.role == "superadmin"
    ):
        _ensure_last_superadmin(
            db,
            target_user,
        )

    db.delete(target_user)
    db.commit()

    return {
        "message": "User deleted successfully."
    }