"""Pydantic schemas for authentication endpoints.

Defines request/response models for registration, login, and token responses.
"""

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Request schema for user registration."""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)


class LoginRequest(BaseModel):
    """Request schema for user login."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Response schema for JWT token."""

    access_token: str
    token_type: str = "bearer"


class RegisterResponse(BaseModel):
    """Response schema for successful registration."""

    id: str
    email: str
    username: str
    role: str
    access_token: str
    token_type: str = "bearer"
