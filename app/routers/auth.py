"""Authentication router: register, login, and logout endpoints.

Handles user registration, credential-based login with JWT issuance,
and token invalidation for logout.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user, get_db
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
)
from app.services import user_service
from app.services.auth_service import (
    blocklist_token,
    create_access_token,
    verify_password,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Create a new user account and return a JWT."""
    existing = await user_service.get_by_email(db, request.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = await user_service.create_user(
        db, request.email, request.username, request.password
    )

    token = create_access_token(data={"sub": str(user.id), "role": user.role})

    return RegisterResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        role=user.role,
        access_token=token,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive a JWT",
)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate a user and return a JWT access token."""
    user = await user_service.get_by_email(db, request.email)
    if user is None or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token)


@router.post(
    "/logout",
    summary="Invalidate the current token",
)
async def logout(current_user=Depends(get_current_user)):
    """Invalidate the current JWT by adding it to the blocklist."""
    token = getattr(current_user, "_token", None)
    if token:
        blocklist_token(token)
    return {"detail": "Successfully logged out"}
