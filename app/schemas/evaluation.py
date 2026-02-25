"""Pydantic schemas for evaluation endpoints.

Defines request/response models for idea evaluation.
"""

from datetime import datetime

from pydantic import BaseModel, Field


class EvaluationCreateRequest(BaseModel):
    """Request schema for evaluating an idea."""

    decision: str = Field(..., pattern="^(accepted|rejected)$")
    comment: str = Field(..., min_length=1)


class EvaluationResponse(BaseModel):
    """Response schema for an evaluation."""

    id: str
    idea_id: str
    evaluator_id: str
    decision: str
    comment: str
    created_at: datetime

    model_config = {"from_attributes": True}
