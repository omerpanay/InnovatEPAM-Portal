"""Idea service for CRUD operations and file handling.

Handles idea creation, listing, detail retrieval, and file uploads.
"""

import logging
import uuid
from pathlib import Path

logger = logging.getLogger(__name__)

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
        logger.info("Saved attachment %s for new idea", file_name)

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
    logger.info("Created new idea with ID %s by author %s", idea.id, author_id)
    return idea


async def get_ideas(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
    mine: bool = False,
    status: str | None = None,
    search: str | None = None,
    current_user_id: uuid.UUID | None = None,
) -> tuple[list[Idea], int]:
    """Get paginated list of ideas with optional filters.

    Args:
        db: Database session.
        skip: Offset for pagination.
        limit: Maximum items per page.
        mine: If True, return only the current user's ideas.
        status: Optional status filter.
        search: Optional search keyword to filter by title or description.
        current_user_id: Current user's ID (for mine filter).

    Returns:
        Tuple of (list of ideas, total count).
    """
    query = select(Idea)
    count_query = select(func.count(Idea.id))

    if search:
        search_filter = Idea.title.ilike(f"%{search}%") | Idea.description.ilike(f"%{search}%")
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

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


async def get_idea_stats(db: AsyncSession) -> dict[str, int]:
    """Get overall statistics for ideas.
    
    Returns:
        Dictionary with counts for total, submitted, accepted, and rejected.
    """
    # Use SQLAlchemy to get grouped counts efficiently
    query = select(Idea.status, func.count(Idea.id)).group_by(Idea.status)
    result = await db.execute(query)
    
    counts = {"submitted": 0, "accepted": 0, "rejected": 0}
    total = 0
    
    for row in result:
        status, count = row
        if status in counts:
            counts[status] = count
        total += count
        
    counts["total"] = total
    return counts


async def update_idea(
    db: AsyncSession,
    idea: Idea,
    title: str | None = None,
    description: str | None = None,
    category: str | None = None,
) -> Idea:
    """Update an idea's editable fields.

    Args:
        db: Database session.
        idea: Idea object to update.
        title: New title (if provided).
        description: New description (if provided).
        category: New category (if provided).

    Returns:
        Updated Idea object.
    """
    if title is not None:
        idea.title = title
    if description is not None:
        idea.description = description
    if category is not None:
        idea.category = category
    await db.commit()
    await db.refresh(idea)
    return idea


async def delete_idea(db: AsyncSession, idea: Idea) -> None:
    """Delete an idea and its attachment file.

    Args:
        db: Database session.
        idea: Idea object to delete.
    """
    # Clean up attachment file if it exists
    if idea.attachment_path:
        file_path = Path(idea.attachment_path)
        if file_path.exists():
            file_path.unlink()
            logger.info("Deleted attachment file at %s", idea.attachment_path)
        else:
            logger.warning("Attachment file at %s not found during idea deletion", idea.attachment_path)

    idea_id = idea.id
    await db.delete(idea)
    await db.commit()
    logger.info("Deleted idea with ID %s", idea_id)
