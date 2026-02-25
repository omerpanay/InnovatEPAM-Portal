"""Pydantic schemas for user endpoints.

Defines request/response models for user management and role updates.
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
