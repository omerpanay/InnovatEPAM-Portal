"""Tests for User Story 1: Registration, Login, and Logout.

TDD RED PHASE: These tests are written FIRST and MUST FAIL before
the corresponding router implementation exists.
"""

from httpx import AsyncClient


# =============================================================================
# T014: Registration Tests (positive + negative)
# =============================================================================


class TestRegistration:
    """Tests for POST /api/v1/auth/register."""

    async def test_register_valid_user(self, client: AsyncClient):
        """Valid registration returns 201 with user data and JWT."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "password": "securepass123",
            },
        )
        if response.status_code != 201:
            print("FAILED RESPONSE:", response.json())
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["username"] == "newuser"
        assert data["role"] == "submitter"
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "id" in data

    async def test_register_duplicate_email(self, client: AsyncClient):
        """Duplicate email returns 400."""
        payload = {
            "email": "dup@example.com",
            "username": "user1",
            "password": "securepass123",
        }
        await client.post("/api/v1/auth/register", json=payload)
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "dup@example.com",
                "username": "user2",
                "password": "securepass456",
            },
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Email already registered"

    async def test_register_missing_fields(self, client: AsyncClient):
        """Missing required fields returns 422."""
        response = await client.post(
            "/api/v1/auth/register",
            json={"email": "user@example.com"},
        )
        assert response.status_code == 422

    async def test_register_invalid_email(self, client: AsyncClient):
        """Invalid email format returns 422."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "not-an-email",
                "username": "user",
                "password": "securepass123",
            },
        )
        assert response.status_code == 422

    async def test_register_short_password(self, client: AsyncClient):
        """Password shorter than 8 characters returns 422."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "user@example.com",
                "username": "user",
                "password": "short",
            },
        )
        assert response.status_code == 422

    async def test_register_short_username(self, client: AsyncClient):
        """Username shorter than 3 characters returns 422."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "user@example.com",
                "username": "ab",
                "password": "securepass123",
            },
        )
        assert response.status_code == 422


# =============================================================================
# T015: Login Tests (positive + negative)
# =============================================================================


class TestLogin:
    """Tests for POST /api/v1/auth/login."""

    async def test_login_valid_credentials(self, client: AsyncClient):
        """Valid login returns 200 with JWT."""
        # Register first
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "login@example.com",
                "username": "loginuser",
                "password": "securepass123",
            },
        )
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "login@example.com",
                "password": "securepass123",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(self, client: AsyncClient):
        """Wrong password returns 401."""
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "login2@example.com",
                "username": "loginuser2",
                "password": "securepass123",
            },
        )
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "login2@example.com",
                "password": "wrongpassword",
            },
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid credentials"

    async def test_login_nonexistent_email(self, client: AsyncClient):
        """Non-existent email returns 401."""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "ghost@example.com",
                "password": "securepass123",
            },
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid credentials"


# =============================================================================
# T016: Logout Tests (positive + negative)
# =============================================================================


class TestLogout:
    """Tests for POST /api/v1/auth/logout."""

    async def test_logout_valid(self, client: AsyncClient):
        """Valid logout returns 200."""
        # Register and get token
        reg = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "logout@example.com",
                "username": "logoutuser",
                "password": "securepass123",
            },
        )
        token = reg.json()["access_token"]
        response = await client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["detail"] == "Successfully logged out"

    async def test_logout_reuse_token(self, client: AsyncClient):
        """Re-using a logged-out token returns 401."""
        reg = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "reuse@example.com",
                "username": "reuseuser",
                "password": "securepass123",
            },
        )
        token = reg.json()["access_token"]
        # Logout
        await client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        # Try to use same token again
        response = await client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 401

    async def test_logout_no_token(self, client: AsyncClient):
        """Missing token returns 401/403."""
        response = await client.post("/api/v1/auth/logout")
        assert response.status_code in (401, 403)
