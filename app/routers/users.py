"""Users router: role management endpoints.

Handles role promotion for the InnovatEPAM Portal.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_db, require_role
from app.schemas.user import RoleUpdateRequest, UserResponse
from app.services import user_service

router = APIRouter(prefix="/api/v1/users", tags=["users"])


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
