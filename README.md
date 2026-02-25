# InnovatEPAM Portal — Phase 1 MVP

Backend API for the InnovatEPAM innovation idea submission and evaluation platform.

## Tech Stack

- **Framework**: FastAPI 0.115
- **Database**: PostgreSQL 15+ (async via SQLAlchemy + asyncpg)
- **Auth**: JWT (python-jose) + bcrypt
- **Migrations**: Alembic
- **Testing**: pytest + pytest-asyncio + httpx

## Quick Start

```bash
# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux/Mac

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

## API Endpoints

| Method   | Path                          | Auth      | Description              |
| -------- | ----------------------------- | --------- | ------------------------ |
| `POST` | `/api/v1/auth/register` | — | Register new user |
| `POST` | `/api/v1/auth/login` | — | Login → JWT |
| `POST` | `/api/v1/auth/logout` | Bearer | Invalidate token |
| `PATCH` | `/api/v1/users/{id}/role` | evaluator | Promote user role |
| `POST` | `/api/v1/ideas` | submitter | Submit idea (multipart) |
| `GET` | `/api/v1/ideas` | any | List ideas (paginated) |
| `GET` | `/api/v1/ideas/{id}` | any | Idea detail |
| `POST` | `/api/v1/ideas/{id}/evaluate` | evaluator | Accept/reject idea |
| `GET` | `/health` | — | Liveness probe |

## Running Tests

```bash
pytest tests/ -v
```

## Project Structure

```text
app/
├── config.py              # Settings via pydantic-settings
├── database.py            # SQLAlchemy async engine + Base
├── main.py                # FastAPI app factory
├── dependencies/auth.py   # get_db, get_current_user, require_role
├── models/                # SQLAlchemy ORM models
├── schemas/               # Pydantic request/response models
├── services/              # Business logic layer
└── routers/               # FastAPI route handlers
tests/
├── conftest.py            # Shared async fixtures
├── test_auth.py           # Auth endpoint tests
├── test_users.py          # Role management tests
├── test_ideas.py          # Idea CRUD + filtering tests
└── test_evaluations.py    # Evaluation tests
```

## Specification

See [specs/001-portal-phase1-mvp/](specs/001-portal-phase1-mvp/) for the full feature specification, implementation plan, data model, and API contracts.
