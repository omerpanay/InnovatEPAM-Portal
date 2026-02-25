# InnovatEPAM Portal — Phase 1 MVP

Full-stack innovation management platform for EPAM employees to submit, browse, and evaluate ideas.

## Tech Stack

### Backend

- **Framework**: FastAPI 0.115 (Python 3.11+)
- **Database**: PostgreSQL 15+ (async via SQLAlchemy + asyncpg)
- **Auth**: JWT (python-jose) + bcrypt
- **Migrations**: Alembic
- **Testing**: pytest + pytest-asyncio + httpx

### Frontend

- **Framework**: React 19 (initialized via Vite 7)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 with EPAM corporate theme
- **API Client**: Axios with JWT interceptor
- **Routing**: React Router 7
- **Forms**: React Hook Form
- **Testing**: Vitest + React Testing Library

### MCP Tools (AI-Assisted Development)

- **PostgreSQL MCP**: Direct database queries for schema verification and data inspection
- **Sequential Thinking MCP**: Structured problem decomposition for complex features
- **Context7 MCP**: Real-time library documentation lookup (React, FastAPI, Tailwind CSS)

## Quick Start

### Backend

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

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with VITE_API_BASE_URL if needed

# Start development server
npm run dev        # → http://localhost:5173

# Run tests
npm run test       # → 15/15 pass

# Production build
npm run build
```

## API Endpoints

| Method   | Path                          | Auth      | Description              |
| -------- | ----------------------------- | --------- | ------------------------ |
| `POST`   | `/api/v1/auth/register`       | —         | Register new user        |
| `POST`   | `/api/v1/auth/login`          | —         | Login → JWT              |
| `POST`   | `/api/v1/auth/logout`         | Bearer    | Invalidate token         |
| `PATCH`  | `/api/v1/users/{id}/role`     | evaluator | Promote user role        |
| `POST`   | `/api/v1/ideas`               | submitter | Submit idea (multipart)  |
| `GET`    | `/api/v1/ideas`               | any       | List ideas (paginated)   |
| `GET`    | `/api/v1/ideas/{id}`          | any       | Idea detail              |
| `POST`   | `/api/v1/ideas/{id}/evaluate` | evaluator | Accept/reject idea       |
| `GET`    | `/health`                     | —         | Liveness probe           |

## Running Tests

```bash
# Backend (34 tests)
pytest tests/ -v

# Frontend (15 tests)
cd frontend && npx vitest run
```

## Project Structure

```text
EpamPortal/
├── app/                        # Backend (FastAPI)
│   ├── config.py               # Settings via pydantic-settings
│   ├── database.py             # SQLAlchemy async engine + Base
│   ├── main.py                 # FastAPI app factory + CORS
│   ├── dependencies/auth.py    # get_db, get_current_user, require_role
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic request/response models
│   ├── services/               # Business logic layer
│   └── routers/                # FastAPI route handlers
├── tests/                      # Backend pytest tests
├── frontend/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components (10)
│   │   ├── pages/              # Route-level pages (5)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # Auth context provider
│   │   ├── api/                # Axios client
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # Constants & helpers
│   └── __tests__/              # Frontend test suites (3)
├── specs/                      # Specification artifacts
│   ├── 001-portal-phase1-mvp/  # Backend spec, plan, tasks, ADRs
│   └── 002-portal-frontend/    # Frontend spec, plan, tasks
└── .specify/memory/            # Project constitution
```

## Architecture Decision Records

See [specs/001-portal-phase1-mvp/adrs/](specs/001-portal-phase1-mvp/adrs/) for documented technical decisions:

- **ADR-001**: Backend Stack — FastAPI + PostgreSQL + SQLAlchemy
- **ADR-002**: JWT Authentication — Token-based auth with blocklist
- **ADR-003**: Frontend Stack — React + Vite + TypeScript + Tailwind CSS

## Specification

- **Backend**: [specs/001-portal-phase1-mvp/](specs/001-portal-phase1-mvp/) — feature spec, plan, data model, API contracts
- **Frontend**: [specs/002-portal-frontend/](specs/002-portal-frontend/) — feature spec, plan, tasks
- **Constitution**: [.specify/memory/constitution.md](.specify/memory/constitution.md) — project principles and standards
