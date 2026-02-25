"""Pydantic schemas for idea endpoints.

Defines request/response models for idea creation, listing, and detail views.
"""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class IdeaCategory(str, Enum):
    """Predefined idea categories."""

    PROCESS_IMPROVEMENT = "process_improvement"
    PRODUCT_INNOVATION = "product_innovation"
    TECH_ENHANCEMENT = "tech_enhancement"
    CULTURE_INITIATIVE = "culture_initiative"
    COST_OPTIMIZATION = "cost_optimization"
    OTHER = "other"


class IdeaCreateRequest(BaseModel):
    """Request schema for idea creation (form fields)."""

    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    category: IdeaCategory


class IdeaResponse(BaseModel):
    """Response schema for a single idea."""

    id: str
    title: str
    description: str
    category: str
    status: str
    author_id: str
    attachment_filename: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IdeaListItem(BaseModel):
    """Abbreviated idea for list responses."""

    id: str
    title: str
    category: str
    status: str
    author_id: str
    created_at: datetime


class IdeaListResponse(BaseModel):
    """Paginated list of ideas."""

    items: list[IdeaListItem]
    total: int
    skip: int
    limit: int


class PaginationParams(BaseModel):
    """Query parameters for pagination."""

    skip: int = Field(0, ge=0)
    limit: int = Field(20, ge=1, le=100)
