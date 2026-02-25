"""Evaluation ORM model for the InnovatEPAM Portal.

Defines the Evaluation table with idea reference, evaluator reference,
decision, and mandatory comment.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Evaluation(Base):
    """Evaluation database model."""

    __tablename__ = "evaluations"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    idea_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("ideas.id"), unique=True, nullable=False
    )
    evaluator_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    decision: Mapped[str] = mapped_column(String(20), nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    idea = relationship("Idea", back_populates="evaluation")
    evaluator = relationship("User", backref="evaluations", lazy="selectin")
