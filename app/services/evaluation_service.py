"""Evaluation service for idea review operations.

Handles creating evaluations and updating idea status.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evaluation import Evaluation
from app.models.idea import Idea


async def evaluate_idea(
    db: AsyncSession,
    idea_id: uuid.UUID,
    evaluator_id: uuid.UUID,
    decision: str,
    comment: str,
) -> Evaluation:
    """Evaluate an idea (accept or reject).

    Args:
        db: Database session.
        idea_id: UUID of the idea to evaluate.
        evaluator_id: UUID of the evaluating user.
        decision: "accepted" or "rejected".
        comment: Mandatory evaluation comment.

    Returns:
        Created Evaluation object.

    Raises:
        ValueError: If idea not found or already evaluated.
    """
    # Check idea exists
    result = await db.execute(select(Idea).where(Idea.id == idea_id))
    idea = result.scalar_one_or_none()
    if idea is None:
        raise ValueError("Idea not found")

    # Check not already evaluated
    existing = await db.execute(select(Evaluation).where(Evaluation.idea_id == idea_id))
    if existing.scalar_one_or_none() is not None:
        raise ValueError("Idea has already been evaluated")

    # Create evaluation
    evaluation = Evaluation(
        id=uuid.uuid4(),
        idea_id=idea_id,
        evaluator_id=evaluator_id,
        decision=decision,
        comment=comment,
    )
    db.add(evaluation)

    # Update idea status
    idea.status = decision
    db.add(idea)

    await db.commit()
    await db.refresh(evaluation)
    return evaluation
