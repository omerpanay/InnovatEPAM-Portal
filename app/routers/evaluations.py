"""Evaluations router: idea evaluation endpoints.

Handles idea evaluation for the InnovatEPAM Portal.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_db, require_role
from app.schemas.evaluation import EvaluationCreateRequest, EvaluationResponse
from app.services import evaluation_service

router = APIRouter(prefix="/api/v1/ideas", tags=["evaluations"])


@router.post(
    "/{idea_id}/evaluate",
    response_model=EvaluationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Evaluate an idea",
)
async def evaluate_idea(
    idea_id: uuid.UUID,
    request: EvaluationCreateRequest,
    current_user=Depends(require_role("evaluator")),
    db: AsyncSession = Depends(get_db),
):
    """Accept or reject an idea. Requires evaluator role."""
    try:
        evaluation = await evaluation_service.evaluate_idea(
            db=db,
            idea_id=idea_id,
            evaluator_id=current_user.id,
            decision=request.decision,
            comment=request.comment,
        )
    except ValueError as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg,
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )

    return EvaluationResponse(
        id=str(evaluation.id),
        idea_id=str(evaluation.idea_id),
        evaluator_id=str(evaluation.evaluator_id),
        decision=evaluation.decision,
        comment=evaluation.comment,
        created_at=evaluation.created_at,
    )
