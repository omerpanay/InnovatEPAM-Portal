"""Tests for User Story 2: Role-Based Access.

TDD RED PHASE: Tests written FIRST, must FAIL before implementation.
"""

from httpx import AsyncClient


# =============================================================================
# T021: Role Promotion Tests (positive + negative)
# =============================================================================


class TestRolePromotion:
    """Tests for PATCH /api/v1/users/{user_id}/role."""

    async def test_evaluator_promotes_user(
        self, evaluator_client: AsyncClient, db_session
    ):
        """An evaluator can promote another user's role → 200."""
        from app.models.user import User
        from app.services.auth_service import hash_password
        import uuid

        # Create a target user to promote
        target_id = uuid.uuid4()
        target = User(
            id=target_id,
            email="target@test.com",
            username="target",
            hashed_password=hash_password("testpass123"),
            role="submitter",
        )
        db_session.add(target)
        await db_session.commit()

        response = await evaluator_client.patch(
            f"/api/v1/users/{target_id}/role",
            json={"role": "evaluator"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "evaluator"
        assert data["email"] == "target@test.com"

    async def test_submitter_cannot_promote(
        self, authenticated_client: AsyncClient, db_session
    ):
        """A submitter trying to promote → 403."""
        import uuid

        fake_id = uuid.uuid4()
        response = await authenticated_client.patch(
            f"/api/v1/users/{fake_id}/role",
            json={"role": "evaluator"},
        )
        assert response.status_code == 403
        assert response.json()["detail"] == "Insufficient permissions"

    async def test_promote_nonexistent_user(self, evaluator_client: AsyncClient):
        """Promoting a non-existent user → 404."""
        import uuid

        fake_id = uuid.uuid4()
        response = await evaluator_client.patch(
            f"/api/v1/users/{fake_id}/role",
            json={"role": "evaluator"},
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "User not found"


# =============================================================================
# T022: Role Enforcement Tests
# =============================================================================


class TestRoleEnforcement:
    """Tests for role-based access enforcement."""

    async def test_unauthenticated_access(self, client: AsyncClient):
        """Unauthenticated access to protected endpoint → 401/403."""
        import uuid

        fake_id = uuid.uuid4()
        response = await client.patch(
            f"/api/v1/users/{fake_id}/role",
            json={"role": "evaluator"},
        )
        assert response.status_code in (401, 403)


# =============================================================================
# Profile & Password Tests
# =============================================================================

class TestProfileAndPassword:
    """Tests for GET/PATCH /me and POST /me/password endpoints."""

    async def test_get_my_profile(self, authenticated_client: AsyncClient):
        response = await authenticated_client.get("/api/v1/users/me")
        assert response.status_code == 200
        assert response.json()["email"] == "submitter@test.com"

    async def test_update_my_profile(self, authenticated_client: AsyncClient):
        response = await authenticated_client.patch(
            "/api/v1/users/me",
            json={"username": "new_username", "email": "new_email@test.com"}
        )
        assert response.status_code == 200
        assert response.json()["username"] == "new_username"
        assert response.json()["email"] == "new_email@test.com"

    async def test_update_duplicate_email(self, authenticated_client: AsyncClient, db_session):
        from app.models.user import User
        import uuid
        user2 = User(
            id=uuid.uuid4(),
            email="otheruser@test.com",
            username="other",
            hashed_password="...",
            role="submitter"
        )
        db_session.add(user2)
        await db_session.commit()

        response = await authenticated_client.patch(
            "/api/v1/users/me",
            json={"email": "otheruser@test.com"}
        )
        assert response.status_code == 400
        assert "Email already in use" in response.json()["detail"]

    async def test_change_password(self, authenticated_client: AsyncClient):
        response = await authenticated_client.post(
            "/api/v1/users/me/password",
            json={"old_password": "testpass123", "new_password": "newsecurepass"}
        )
        assert response.status_code == 200
        assert "Password changed successfully" in response.json()["detail"]

    async def test_change_password_wrong_old(self, authenticated_client: AsyncClient):
        response = await authenticated_client.post(
            "/api/v1/users/me/password",
            json={"old_password": "wrongpassword", "new_password": "newsecurepass"}
        )
        assert response.status_code == 400
        assert "Current password is incorrect" in response.json()["detail"]


# =============================================================================
# Admin User List Tests
# =============================================================================

class TestUserListing:
    """Tests for GET /users listing endpoints."""

    async def test_list_users_as_evaluator(self, evaluator_client: AsyncClient):
        response = await evaluator_client.get("/api/v1/users")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] >= 1

    async def test_list_users_as_submitter(self, authenticated_client: AsyncClient):
        response = await authenticated_client.get("/api/v1/users")
        # Submitter should be forbidden from accessing admin endpoints
        assert response.status_code == 403
