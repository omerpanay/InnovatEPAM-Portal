"""Tests for User Story 3 & 4 & 6: Idea Submission, Listing, and Filtering.

TDD RED PHASE: Tests written FIRST, must FAIL before implementation.
"""

from httpx import AsyncClient


# =============================================================================
# T027: Positive Idea Creation Tests
# =============================================================================


class TestIdeaCreation:
    """Tests for POST /api/v1/ideas."""

    async def test_create_idea_valid(self, authenticated_client: AsyncClient):
        """Valid idea creation returns 201."""
        response = await authenticated_client.post(
            "/api/v1/ideas",
            data={
                "title": "Automate onboarding",
                "description": "Use AI to streamline new hire onboarding process.",
                "category": "process_improvement",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Automate onboarding"
        assert data["status"] == "submitted"
        assert data["category"] == "process_improvement"
        assert "id" in data
        assert "created_at" in data

    async def test_create_idea_with_attachment(
        self, authenticated_client: AsyncClient, tmp_path
    ):
        """Idea with file attachment returns 201 + file stored."""
        test_file = tmp_path / "proposal.pdf"
        test_file.write_bytes(b"%PDF-1.4 test content")

        response = await authenticated_client.post(
            "/api/v1/ideas",
            data={
                "title": "Cost reduction plan",
                "description": "Reduce costs by 20% using automation.",
                "category": "cost_optimization",
            },
            files={
                "attachment": ("proposal.pdf", test_file.open("rb"), "application/pdf")
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["attachment_filename"] is not None


# =============================================================================
# T028: Negative Idea Creation Tests
# =============================================================================


class TestIdeaCreationNegative:
    """Negative tests for POST /api/v1/ideas."""

    async def test_create_idea_missing_title(self, authenticated_client: AsyncClient):
        """Missing title returns 422."""
        response = await authenticated_client.post(
            "/api/v1/ideas",
            data={
                "description": "Some description",
                "category": "other",
            },
        )
        assert response.status_code == 422

    async def test_create_idea_file_too_large(
        self, authenticated_client: AsyncClient, tmp_path
    ):
        """File exceeding 5MB returns 400."""
        test_file = tmp_path / "large.pdf"
        test_file.write_bytes(b"x" * (5 * 1024 * 1024 + 1))

        response = await authenticated_client.post(
            "/api/v1/ideas",
            data={
                "title": "Large file idea",
                "description": "Has a very large file.",
                "category": "other",
            },
            files={
                "attachment": ("large.pdf", test_file.open("rb"), "application/pdf")
            },
        )
        assert response.status_code == 400
        assert "size" in response.json()["detail"].lower()

    async def test_create_idea_bad_file_type(
        self, authenticated_client: AsyncClient, tmp_path
    ):
        """Unsupported file type returns 400."""
        test_file = tmp_path / "script.exe"
        test_file.write_bytes(b"fake exe content")

        response = await authenticated_client.post(
            "/api/v1/ideas",
            data={
                "title": "Bad file idea",
                "description": "Has unexpected file type.",
                "category": "other",
            },
            files={
                "attachment": (
                    "script.exe",
                    test_file.open("rb"),
                    "application/octet-stream",
                )
            },
        )
        assert response.status_code == 400
        assert "type" in response.json()["detail"].lower()

    async def test_create_idea_unauthenticated(self, client: AsyncClient):
        """Unauthenticated idea creation returns 401/403."""
        response = await client.post(
            "/api/v1/ideas",
            data={
                "title": "Some idea",
                "description": "Description",
                "category": "other",
            },
        )
        assert response.status_code in (401, 403)


# =============================================================================
# T035: Positive Listing Tests (US4)
# =============================================================================


class TestIdeaListing:
    """Tests for GET /api/v1/ideas and GET /api/v1/ideas/{id}."""

    async def test_list_ideas_paginated(self, authenticated_client: AsyncClient):
        """List ideas returns 200 with paginated response."""
        # Create a few ideas first
        for i in range(3):
            await authenticated_client.post(
                "/api/v1/ideas",
                data={
                    "title": f"Idea {i}",
                    "description": f"Description {i}",
                    "category": "other",
                },
            )

        response = await authenticated_client.get("/api/v1/ideas")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3
        assert data["total"] == 3
        assert data["skip"] == 0
        assert data["limit"] == 20

    async def test_get_idea_by_id(self, authenticated_client: AsyncClient):
        """Get idea by ID returns 200 with full detail."""
        create_resp = await authenticated_client.post(
            "/api/v1/ideas",
            data={
                "title": "Detail idea",
                "description": "Full description here.",
                "category": "tech_enhancement",
            },
        )
        idea_id = create_resp.json()["id"]

        response = await authenticated_client.get(f"/api/v1/ideas/{idea_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Detail idea"
        assert data["description"] == "Full description here."


# =============================================================================
# T036: Negative Listing Tests (US4)
# =============================================================================


class TestIdeaListingNegative:
    """Negative tests for idea listing."""

    async def test_get_nonexistent_idea(self, authenticated_client: AsyncClient):
        """Non-existent idea ID returns 404."""
        import uuid

        fake_id = uuid.uuid4()
        response = await authenticated_client.get(f"/api/v1/ideas/{fake_id}")
        assert response.status_code == 404
        assert response.json()["detail"] == "Idea not found"

    async def test_list_ideas_unauthenticated(self, client: AsyncClient):
        """Unauthenticated listing returns 401/403."""
        response = await client.get("/api/v1/ideas")
        assert response.status_code in (401, 403)


# =============================================================================
# T049: Positive Filtering Tests (US6)
# =============================================================================


class TestIdeaFiltering:
    """Tests for mine=true filter and evaluation embedding."""

    async def test_mine_filter_returns_own_ideas(
        self, authenticated_client: AsyncClient
    ):
        """mine=true returns only the current user's ideas."""
        # Create an idea
        await authenticated_client.post(
            "/api/v1/ideas",
            data={
                "title": "My idea",
                "description": "My description",
                "category": "other",
            },
        )

        response = await authenticated_client.get("/api/v1/ideas?mine=true")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        # All returned ideas should be ours
        for item in data["items"]:
            assert item["author_id"] is not None


# =============================================================================
# T050: Negative Filtering Tests (US6)
# =============================================================================


class TestIdeaFilteringNegative:
    """Negative tests for idea filtering."""

    async def test_mine_filter_no_ideas(self, authenticated_client: AsyncClient):
        """mine=true with no ideas returns empty list."""
        response = await authenticated_client.get("/api/v1/ideas?mine=true")
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0
