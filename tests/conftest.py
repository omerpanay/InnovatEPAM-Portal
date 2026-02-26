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

    # Construct safe TEST_DATABASE_URL
    # Never wipe the main database!
    test_db_url = settings.DATABASE_URL
    if not test_db_url.endswith("_test"):
        test_db_url += "_test"

    # Synchronously attempt to create the test database if it doesn't exist
    import psycopg
    from psycopg.errors import DuplicateDatabase
    sync_url = test_db_url.replace("+asyncpg", "").replace("_test", "")
    try:
        with psycopg.connect(sync_url, autocommit=True) as conn:
            with conn.cursor() as cur:
                # Need to use plain strings for CREATE DATABASE since parameters aren't allowed
                # We know the DB name is just the original name + _test
                original_db_name = sync_url.split("/")[-1]
                test_db_name = original_db_name + "_test"
                cur.execute(f"CREATE DATABASE {test_db_name}")
    except DuplicateDatabase:
        pass
    except Exception as e:
        print(f"Warning: Could not auto-create test database: {e}")

    _test_engine = create_async_engine(
        test_db_url, echo=False, pool_pre_ping=True
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
        # Truncate BEFORE test to ensure clean state
        try:
            await conn.execute(text("TRUNCATE TABLE evaluations, ideas, users CASCADE"))
        except Exception:
            pass

    yield

    # Truncate data but keep tables intact
    async with _test_engine.begin() as conn:
        try:
            await conn.execute(text("TRUNCATE TABLE evaluations, ideas, users CASCADE"))
        except Exception:
            pass

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
