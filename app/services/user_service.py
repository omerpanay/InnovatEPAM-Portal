"""User service for CRUD operations.

Handles user creation, lookup, and role management.
"""

import logging
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.services.auth_service import hash_password, verify_password

logger = logging.getLogger(__name__)


async def create_user(
    db: AsyncSession,
    email: str,
    username: str,
    password: str,
) -> User:
    """Create a new user with hashed password.

    Args:
        db: Database session.
        email: User's email address.
        username: User's display name.
        password: Plaintext password (will be hashed).

    Returns:
        The created User object.
    """
    user = User(
        id=uuid.uuid4(),
        email=email,
        username=username,
        hashed_password=hash_password(password),
        role="submitter",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    logger.info("Created new user %s with role %s", user.email, user.role)
    return user


async def get_by_email(db: AsyncSession, email: str) -> User | None:
    """Find a user by email address.

    Args:
        db: Database session.
        email: Email to search for.

    Returns:
        User object or None if not found.
    """
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    """Find a user by ID.

    Args:
        db: Database session.
        user_id: UUID to search for.

    Returns:
        User object or None if not found.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def update_role(
    db: AsyncSession, user_id: uuid.UUID, new_role: str
) -> User | None:
    """Update a user's role.

    Args:
        db: Database session.
        user_id: Target user ID.
        new_role: New role value.

    Returns:
        Updated User or None if not found.
    """
    user = await get_by_id(db, user_id)
    if user is None:
        logger.warning("Attempted to update role for non-existent user ID %s", user_id)
        return None
    
    old_role = user.role
    user.role = new_role
    await db.commit()
    await db.refresh(user)
    logger.info("Updated role for user %s from %s to %s", user.email, old_role, new_role)
    return user


async def update_profile(
    db: AsyncSession,
    user: User,
    username: str | None = None,
    email: str | None = None,
) -> User:
    """Update a user's profile information.

    Args:
        db: Database session.
        user: User object to update.
        username: New username (if provided).
        email: New email (if provided).

    Returns:
        Updated User object.
    """
    if username is not None:
        user.username = username
    if email is not None:
        # Check uniqueness
        existing = await get_by_email(db, email)
        if existing and existing.id != user.id:
            logger.warning("User %s attempted to change email to %s which is already in use by %s", user.id, email, existing.id)
            raise ValueError("Email already in use")
        user.email = email
    await db.commit()
    await db.refresh(user)
    logger.info("Updated profile for user %s", user.email)
    return user


async def change_password(
    db: AsyncSession,
    user: User,
    old_password: str,
    new_password: str,
) -> bool:
    """Change a user's password.

    Args:
        db: Database session.
        user: User object.
        old_password: Current password for verification.
        new_password: New password to set.

    Returns:
        True if password was changed.

    Raises:
        ValueError: If old password is incorrect.
    """
    if not verify_password(old_password, user.hashed_password):
        logger.warning("Failed password change attempt for user %s (incorrect current password)", user.email)
        raise ValueError("Current password is incorrect")
    user.hashed_password = hash_password(new_password)
    await db.commit()
    logger.info("Password changed successfully for user %s", user.email)
    return True


async def list_users(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
) -> tuple[list[User], int]:
    """List all users with pagination.

    Args:
        db: Database session.
        skip: Offset for pagination.
        limit: Maximum items per page.

    Returns:
        Tuple of (list of users, total count).
    """
    from sqlalchemy import func

    count_result = await db.execute(select(func.count(User.id)))
    total = count_result.scalar() or 0

    result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
    )
    users = list(result.scalars().all())
    return users, total
