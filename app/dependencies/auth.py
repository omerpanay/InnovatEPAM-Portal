"""Authentication and authorization dependency injection providers.

Provides FastAPI dependencies for extracting the current user from JWT,
enforcing role-based access, and yielding database sessions.
"""

import uuid
from collections.abc import AsyncGenerator, Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory
from app.services.auth_service import decode_access_token

security = HTTPBearer()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session per request."""
    async with async_session_factory() as session:
        yield session


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    """Decode JWT, validate token, and return the current user.

    Raises:
        HTTPException 401: If the token is missing, invalid, expired,
            or blocklisted.
    """
    from app.models.user import User

    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    # Attach the raw token for logout
    user._token = token  # type: ignore[attr-defined]
    return user


def require_role(role: str) -> Callable:
    """Return a dependency that checks the user's role.

    Args:
        role: Required role name (e.g., 'evaluator').

    Returns:
        A FastAPI dependency function.

    Raises:
        HTTPException 403: If the user's role does not match.
    """

    async def role_checker(current_user=Depends(get_current_user)):
        if current_user.role != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return role_checker
