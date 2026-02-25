"""Idea service for CRUD operations and file handling.

Handles idea creation, listing, detail retrieval, and file uploads.
"""

import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.idea import Idea

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


async def create_idea(
    db: AsyncSession,
    title: str,
    description: str,
    category: str,
    author_id: uuid.UUID,
    attachment: UploadFile | None = None,
) -> Idea:
    """Create a new idea with optional file attachment.

    Args:
        db: Database session.
        title: Idea title.
        description: Idea description.
        category: Idea category.
        author_id: UUID of the submitting user.
        attachment: Optional file upload.

    Returns:
        Created Idea object.

    Raises:
        ValueError: If file is too large or has unsupported type.
    """
    attachment_path = None

    if attachment and attachment.filename:
        # Validate file extension
        ext = Path(attachment.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError("File type not allowed")

        # Read and validate size
        content = await attachment.read()
        if len(content) > MAX_FILE_SIZE:
            raise ValueError("File size exceeds maximum limit")

        # Save file
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        file_name = f"{uuid.uuid4()}{ext}"
        file_path = upload_dir / file_name
        file_path.write_bytes(content)
        attachment_path = str(file_path)

    idea = Idea(
        id=uuid.uuid4(),
        title=title,
        description=description,
        category=category,
        status="submitted",
        author_id=author_id,
        attachment_path=attachment_path,
    )
    db.add(idea)
    await db.commit()
    await db.refresh(idea)
    return idea


async def get_ideas(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
    mine: bool = False,
    status: str | None = None,
    current_user_id: uuid.UUID | None = None,
) -> tuple[list[Idea], int]:
    """Get paginated list of ideas with optional filters.

    Args:
        db: Database session.
        skip: Offset for pagination.
        limit: Maximum items per page.
        mine: If True, return only the current user's ideas.
        status: Optional status filter.
        current_user_id: Current user's ID (for mine filter).

    Returns:
        Tuple of (list of ideas, total count).
    """
    query = select(Idea)
    count_query = select(func.count(Idea.id))

    if mine and current_user_id:
        query = query.where(Idea.author_id == current_user_id)
        count_query = count_query.where(Idea.author_id == current_user_id)

    if status:
        query = query.where(Idea.status == status)
        count_query = count_query.where(Idea.status == status)

    query = query.order_by(Idea.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    ideas = list(result.scalars().all())

    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    return ideas, total


async def get_idea_by_id(db: AsyncSession, idea_id: uuid.UUID) -> Idea | None:
    """Get a single idea by ID.

    Args:
        db: Database session.
        idea_id: UUID of the idea.

    Returns:
        Idea object or None.
    """
    result = await db.execute(select(Idea).where(Idea.id == idea_id))
    return result.scalar_one_or_none()
