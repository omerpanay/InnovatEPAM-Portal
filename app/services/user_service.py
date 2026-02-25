"""User service for CRUD operations.

Handles user creation, lookup, and role management.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.services.auth_service import hash_password


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
        return None
    user.role = new_role
    await db.commit()
    await db.refresh(user)
    return user
