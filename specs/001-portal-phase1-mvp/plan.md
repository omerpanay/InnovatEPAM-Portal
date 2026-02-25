# Implementation Plan: InnovatEPAM Portal — Phase 1 MVP

**Branch**: `001-portal-phase1-mvp` | **Date**: 2026-02-25 | **Spec**: [spec.md](file:///c:/new/EpamPortal/specs/001-portal-phase1-mvp/spec.md)
**Input**: Feature specification from `/specs/001-portal-phase1-mvp/spec.md`

## Summary

Build the backend API for the InnovatEPAM Portal MVP — a FastAPI web
service backed by PostgreSQL that enables users to register/login (JWT),
submit innovation ideas with file attachments, and allows evaluators to
accept or reject ideas with comments. The architecture follows strict
SRP with decoupled services, Pydantic request/response schemas, and
SQLAlchemy ORM models. Every endpoint is covered by TDD (pytest).

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, Uvicorn, SQLAlchemy 2.x, Pydantic v2, python-jose (JWT), passlib[bcrypt], python-multipart
**Storage**: PostgreSQL 15+ (via SQLAlchemy ORM)
**Testing**: pytest, pytest-asyncio, httpx (TestClient)
**Target Platform**: Linux server / Docker container
**Project Type**: web-service (backend API only, Phase 1)
**Performance Goals**: 100 concurrent authenticated users (SC-004)
**Constraints**: File uploads ≤ 5 MB, JWT-based stateless auth with token blocklist for logout
**Scale/Scope**: ~10 API endpoints, 3 database tables, single-service deployment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. SDD** | ✅ PASS | Spec approved → Plan in progress → Tasks next |
| **II. TDD** | ✅ PASS | Every endpoint will have positive + negative pytest cases; Red-Green-Refactor enforced |
| **III. Architectural Integrity (SRP)** | ✅ PASS | Separate modules: models, schemas, services, routers, dependencies; no circular imports |
| **IV. YAGNI** | ✅ PASS | Only FR-001–FR-017 are implemented; no speculative features |
| **Tech Stack** | ✅ PASS | Python 3.11+, FastAPI, PostgreSQL, SQLAlchemy, JWT, pytest — exact match |
| **Engineering Standards** | ✅ PASS | PEP 8 (ruff), type hints, Google-style docstrings, standardized error JSON |

No violations. No Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/001-portal-phase1-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   ├── auth.md
│   ├── users.md
│   ├── ideas.md
│   └── evaluations.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── __init__.py
├── main.py                  # FastAPI app factory, router registration
├── config.py                # Settings via pydantic-settings (env vars)
├── database.py              # SQLAlchemy engine, session factory
├── models/
│   ├── __init__.py
│   ├── user.py              # User ORM model
│   ├── idea.py              # Idea ORM model
│   └── evaluation.py        # Evaluation ORM model
├── schemas/
│   ├── __init__.py
│   ├── auth.py              # Register/Login request & token response
│   ├── user.py              # User response, role update
│   ├── idea.py              # Idea create/response/list
│   └── evaluation.py        # Evaluation create/response
├── services/
│   ├── __init__.py
│   ├── auth_service.py      # Password hashing, JWT create/verify
│   ├── user_service.py      # User CRUD, role management
│   ├── idea_service.py      # Idea CRUD, file handling
│   └── evaluation_service.py # Evaluation logic
├── routers/
│   ├── __init__.py
│   ├── auth.py              # POST /register, POST /login, POST /logout
│   ├── users.py             # PATCH /users/{id}/role
│   ├── ideas.py             # POST /ideas, GET /ideas, GET /ideas/{id}
│   └── evaluations.py       # POST /ideas/{id}/evaluate
├── dependencies/
│   ├── __init__.py
│   └── auth.py              # get_current_user, require_role DI
└── uploads/                 # Local file storage (gitignored)

tests/
├── conftest.py              # Fixtures: TestClient, test DB, auth helpers
├── test_auth.py             # Registration, login, logout, token tests
├── test_users.py            # Role promotion tests
├── test_ideas.py            # Idea CRUD, file upload, pagination tests
└── test_evaluations.py      # Accept/reject, permission, edge case tests

alembic/                     # Database migrations
├── alembic.ini
├── env.py
└── versions/

requirements.txt             # Pinned production dependencies
requirements-dev.txt         # Dev/test dependencies (pytest, ruff, httpx)
.env.example                 # Environment variable template
```

**Structure Decision**: Single-project layout (backend API only).
No frontend in Phase 1. The `app/` package contains all source code;
`tests/` is top-level for pytest discovery. Alembic manages migrations.

## Architectural Components

### FastAPI Routers (app/routers/)

Each router has a single responsibility corresponding to one domain:

| Router | Prefix | Responsibility |
|--------|--------|----------------|
| `auth.py` | `/api/v1/auth` | Register, login, logout |
| `users.py` | `/api/v1/users` | Role management |
| `ideas.py` | `/api/v1/ideas` | Idea CRUD + file upload |
| `evaluations.py` | `/api/v1/ideas` | Evaluation of ideas |

### SQLAlchemy Models (app/models/)

Three ORM models mapped 1:1 to database tables. See
[data-model.md](file:///c:/new/EpamPortal/specs/001-portal-phase1-mvp/data-model.md)
for full schema.

### Pydantic Schemas (app/schemas/)

Request/response validation separated from ORM models per SRP:

| Schema Module | Classes |
|---------------|---------|
| `auth.py` | `RegisterRequest`, `LoginRequest`, `TokenResponse` |
| `user.py` | `UserResponse`, `RoleUpdateRequest` |
| `idea.py` | `IdeaCreateRequest`, `IdeaResponse`, `IdeaListResponse`, `PaginationParams` |
| `evaluation.py` | `EvaluationCreateRequest`, `EvaluationResponse` |

### Dependency Injection (app/dependencies/)

| Dependency | Purpose |
|------------|---------|
| `get_current_user` | Decodes JWT from `Authorization: Bearer` header; raises 401 if invalid/expired |
| `require_role(role)` | Returns a dependency that checks the user's role; raises 403 if insufficient |
| `get_db` | Yields a SQLAlchemy session per request |

### Token Blocklist Strategy

- JWTs are short-lived (30 min default, configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`).
- On logout, the token's `jti` (JWT ID) is added to an in-memory set
  (Phase 1) or a `token_blocklist` DB table (production hardening).
- `get_current_user` checks the blocklist before accepting a token.

## Database Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    username      VARCHAR(100) NOT NULL,
    hashed_password TEXT NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'submitter'
                  CHECK (role IN ('submitter', 'evaluator')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ideas table
CREATE TABLE ideas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    category        VARCHAR(100) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'submitted'
                    CHECK (status IN ('submitted', 'under_review',
                                      'accepted', 'rejected')),
    author_id       UUID NOT NULL REFERENCES users(id),
    attachment_path VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ideas_author  ON ideas(author_id);
CREATE INDEX idx_ideas_status  ON ideas(status);

-- Evaluations table
CREATE TABLE evaluations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id       UUID NOT NULL REFERENCES ideas(id) UNIQUE,
    evaluator_id  UUID NOT NULL REFERENCES users(id),
    decision      VARCHAR(20) NOT NULL
                  CHECK (decision IN ('accepted', 'rejected')),
    comment       TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## API Endpoints

All endpoints are prefixed with `/api/v1`. Detailed contracts are in
[contracts/](file:///c:/new/EpamPortal/specs/001-portal-phase1-mvp/contracts/).

| Method | Path | Auth | Role | Description | Spec Ref |
|--------|------|------|------|-------------|----------|
| POST | `/auth/register` | ❌ | — | Create account | FR-001,002,003 |
| POST | `/auth/login` | ❌ | — | Authenticate, return JWT | FR-004 |
| POST | `/auth/logout` | ✅ | any | Blocklist token | FR-005 |
| PATCH | `/users/{id}/role` | ✅ | evaluator | Promote user role | FR-008 |
| POST | `/ideas` | ✅ | submitter | Submit idea + attachment | FR-009,010,011 |
| GET | `/ideas` | ✅ | any | List ideas (paginated) | FR-012,016 |
| GET | `/ideas/{id}` | ✅ | any | Get idea detail | FR-013 |
| POST | `/ideas/{id}/evaluate` | ✅ | evaluator | Accept/reject idea | FR-014,015 |

## Error Response Contract

All errors follow the constitution's standardized JSON format:

```json
{
  "detail": "<human-readable message>"
}
```

Validation errors (422) use FastAPI's default Pydantic format:

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Complexity Tracking

> No Constitution Check violations. Table intentionally left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| — | — | — |
