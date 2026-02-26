"""Users router: profile, password, role management, and admin user listing.

Handles user self-service and admin endpoints for the InnovatEPAM Portal.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user, get_db, require_role
from app.schemas.user import (
    PasswordChangeRequest,
    ProfileUpdateRequest,
    RoleUpdateRequest,
    UserListResponse,
    UserResponse,
)
from app.services import user_service

router = APIRouter(prefix="/api/v1/users", tags=["users"])


# ── Self-service endpoints ──


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
async def get_my_profile(current_user=Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        role=current_user.role,
        created_at=current_user.created_at,
    )


@router.patch(
    "/me",
    response_model=UserResponse,
    summary="Update current user profile",
)
async def update_my_profile(
    request: ProfileUpdateRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the authenticated user's username and/or email."""
    try:
        user = await user_service.update_profile(
            db, current_user, username=request.username, email=request.email
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        role=user.role,
        created_at=user.created_at,
    )


@router.post(
    "/me/password",
    summary="Change password",
)
async def change_password(
    request: PasswordChangeRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change the authenticated user's password."""
    try:
        await user_service.change_password(
            db, current_user, request.old_password, request.new_password
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    return {"detail": "Password changed successfully"}


# ── Admin endpoints ──


@router.get(
    "",
    response_model=UserListResponse,
    summary="List all users (evaluator only)",
)
async def list_users(
    skip: int = 0,
    limit: int = 50,
    current_user=Depends(require_role("evaluator")),
    db: AsyncSession = Depends(get_db),
):
    """Return a paginated list of all users. Requires evaluator role."""
    users, total = await user_service.list_users(db, skip=skip, limit=limit)
    return UserListResponse(
        items=[
            UserResponse(
                id=str(u.id),
                email=u.email,
                username=u.username,
                role=u.role,
                created_at=u.created_at,
            )
            for u in users
        ],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.patch(
    "/{user_id}/role",
    response_model=UserResponse,
    summary="Update a user's role",
)
async def update_user_role(
    user_id: uuid.UUID,
    request: RoleUpdateRequest,
    current_user=Depends(require_role("evaluator")),
    db: AsyncSession = Depends(get_db),
):
    """Promote or change a user's role. Requires evaluator role."""
    user = await user_service.update_role(db, user_id, request.role)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        role=user.role,
        created_at=user.created_at,
    )
