"""Shared test fixtures for the InnovatEPAM Portal test suite.

Provides AsyncClient, test database override, and authentication
helper fixtures for all tests.
"""

import uuid
from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.database import Base
from app.dependencies.auth import get_db
from app.main import app
from app.services.auth_service import create_access_token, token_blocklist

# Module-level engine and session factory — recreated per test
_test_engine = None
_test_session_factory = None


@pytest.fixture(autouse=True)
async def setup_and_teardown():
    """Set up and tear down the database for each test.

    Uses CREATE IF NOT EXISTS + TRUNCATE so the schema is preserved
    for the running application after tests complete.
    """
    global _test_engine, _test_session_factory

    # Import all models
    from app.models import user  # noqa: F401
    from app.models import idea  # noqa: F401
    from app.models import evaluation  # noqa: F401

    _test_engine = create_async_engine(
        settings.DATABASE_URL, echo=False, pool_pre_ping=True
    )
    _test_session_factory = async_sessionmaker(
        _test_engine, class_=AsyncSession, expire_on_commit=False
    )

    # Override get_db with this test's session factory
    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with _test_session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = _override_get_db

    # Ensure tables exist (idempotent — won't recreate if already present)
    async with _test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    # Truncate data but keep tables intact
    async with _test_engine.begin() as conn:
        await conn.execute(text("TRUNCATE TABLE evaluations, ideas, users CASCADE"))

    await _test_engine.dispose()

    # Clear token blocklist between tests
    token_blocklist.clear()


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a database session for tests."""
    async with _test_session_factory() as session:
        yield session


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Provide an async HTTP client for testing."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as ac:
        yield ac


@pytest.fixture
async def authenticated_client(
    client: AsyncClient, db_session: AsyncSession
) -> AsyncGenerator[AsyncClient, None]:
    """Provide an authenticated client with a submitter user."""
    from app.models.user import User
    from app.services.auth_service import hash_password

    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="submitter@test.com",
        username="submitter",
        hashed_password=hash_password("testpass123"),
        role="submitter",
    )
    db_session.add(user)
    await db_session.commit()

    token = create_access_token(data={"sub": str(user_id), "role": "submitter"})
    client.headers["Authorization"] = f"Bearer {token}"
    yield client


@pytest.fixture
async def evaluator_client(
    client: AsyncClient, db_session: AsyncSession
) -> AsyncGenerator[AsyncClient, None]:
    """Provide an authenticated client with an evaluator user."""
    from app.models.user import User
    from app.services.auth_service import hash_password

    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="evaluator@test.com",
        username="evaluator",
        hashed_password=hash_password("testpass123"),
        role="evaluator",
    )
    db_session.add(user)
    await db_session.commit()

    token = create_access_token(data={"sub": str(user_id), "role": "evaluator"})
    client.headers["Authorization"] = f"Bearer {token}"
    yield client
