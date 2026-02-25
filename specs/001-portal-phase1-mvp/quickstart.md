# Quickstart: InnovatEPAM Portal — Phase 1 MVP

## Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Git

## Setup

```bash
# Clone and enter the project
git clone <repo-url>
cd EpamPortal
git checkout 001-portal-phase1-mvp

# Create virtual environment
python -m venv .venv
source .venv/bin/activate        # Linux/Mac
.venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/innovatepam
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=./app/uploads
```

## Database

```bash
# Create the database
createdb innovatepam

# Run migrations
alembic upgrade head
```

## Run the Server

```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

## Run Tests

```bash
# Run all tests
pytest -v

# Run with coverage
pytest --cov=app --cov-report=term-missing
```

## Linting

```bash
ruff check app/ tests/
ruff format app/ tests/
```

## Project Structure

```
app/            → Application source code
  models/       → SQLAlchemy ORM models
  schemas/      → Pydantic request/response schemas
  services/     → Business logic layer
  routers/      → FastAPI route handlers
  dependencies/ → Auth & DB dependency injection
tests/          → pytest test suite
alembic/        → Database migrations
```
