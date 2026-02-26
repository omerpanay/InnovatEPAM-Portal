"""Pydantic schemas for user endpoints.

Defines request/response models for user management, profiles, and role updates.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class UserResponse(BaseModel):
    """Response schema for user data."""

    id: str
    email: str
    username: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class RoleUpdateRequest(BaseModel):
    """Request schema for role update."""

    role: str = Field(..., pattern="^(submitter|evaluator)$")


class ProfileUpdateRequest(BaseModel):
    """Request schema for profile updates."""

    username: str | None = Field(None, min_length=1, max_length=100)
    email: str | None = Field(None, min_length=1, max_length=255)


class PasswordChangeRequest(BaseModel):
    """Request schema for password change."""

    old_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6, max_length=128)


class UserListResponse(BaseModel):
    """Paginated list of users."""

    items: list[UserResponse]
    total: int
    skip: int
    limit: int
