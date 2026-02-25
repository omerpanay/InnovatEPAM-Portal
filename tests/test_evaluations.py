"""Tests for User Story 5: Idea Evaluation by Admin.

TDD RED PHASE: Tests written FIRST, must FAIL before implementation.
"""

import uuid

from httpx import AsyncClient


# =============================================================================
# T041: Positive Evaluation Tests
# =============================================================================


class TestEvaluation:
    """Tests for POST /api/v1/ideas/{idea_id}/evaluate."""

    async def _create_idea(self, client: AsyncClient) -> str:
        """Helper: create an idea and return its ID."""
        resp = await client.post(
            "/api/v1/ideas",
            data={
                "title": "Test idea for eval",
                "description": "Needs evaluation.",
                "category": "other",
            },
        )
        return resp.json()["id"]

    async def test_accept_idea(
        self, authenticated_client: AsyncClient, evaluator_client: AsyncClient
    ):
        """Evaluator accepts an idea → 201 + status updated."""
        idea_id = await self._create_idea(authenticated_client)

        response = await evaluator_client.post(
            f"/api/v1/ideas/{idea_id}/evaluate",
            json={"decision": "accepted", "comment": "Great idea!"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["decision"] == "accepted"
        assert data["comment"] == "Great idea!"
        assert data["idea_id"] == idea_id

    async def test_reject_idea(
        self, authenticated_client: AsyncClient, evaluator_client: AsyncClient
    ):
        """Evaluator rejects an idea → 201 + status updated."""
        idea_id = await self._create_idea(authenticated_client)

        response = await evaluator_client.post(
            f"/api/v1/ideas/{idea_id}/evaluate",
            json={"decision": "rejected", "comment": "Not feasible."},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["decision"] == "rejected"


# =============================================================================
# T042: Negative Evaluation Tests
# =============================================================================


class TestEvaluationNegative:
    """Negative tests for idea evaluation."""

    async def _create_idea(self, client: AsyncClient) -> str:
        """Helper: create an idea and return its ID."""
        resp = await client.post(
            "/api/v1/ideas",
            data={
                "title": "Negative test idea",
                "description": "For negative tests.",
                "category": "other",
            },
        )
        return resp.json()["id"]

    async def test_evaluate_missing_comment(
        self, authenticated_client: AsyncClient, evaluator_client: AsyncClient
    ):
        """Missing comment returns 422 (Pydantic validation)."""
        idea_id = await self._create_idea(authenticated_client)

        response = await evaluator_client.post(
            f"/api/v1/ideas/{idea_id}/evaluate",
            json={"decision": "accepted"},
        )
        assert response.status_code == 422

    async def test_evaluate_already_evaluated(
        self, authenticated_client: AsyncClient, evaluator_client: AsyncClient
    ):
        """Re-evaluating an already evaluated idea returns 400."""
        idea_id = await self._create_idea(authenticated_client)

        # First evaluation
        await evaluator_client.post(
            f"/api/v1/ideas/{idea_id}/evaluate",
            json={"decision": "accepted", "comment": "First eval."},
        )
        # Second evaluation
        response = await evaluator_client.post(
            f"/api/v1/ideas/{idea_id}/evaluate",
            json={"decision": "rejected", "comment": "Second eval."},
        )
        assert response.status_code == 400
        assert "already" in response.json()["detail"].lower()

    async def test_submitter_cannot_evaluate(self, authenticated_client: AsyncClient):
        """A submitter trying to evaluate returns 403."""
        idea_id = await self._create_idea(authenticated_client)

        response = await authenticated_client.post(
            f"/api/v1/ideas/{idea_id}/evaluate",
            json={"decision": "accepted", "comment": "I'll approve my own!"},
        )
        assert response.status_code == 403

    async def test_evaluate_nonexistent_idea(self, evaluator_client: AsyncClient):
        """Evaluating a non-existent idea returns 404."""
        fake_id = uuid.uuid4()
        response = await evaluator_client.post(
            f"/api/v1/ideas/{fake_id}/evaluate",
            json={"decision": "accepted", "comment": "Ghost idea."},
        )
        assert response.status_code == 404
