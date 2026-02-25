# ADR-001: Backend Technology Stack

**Status**: Accepted
**Date**: 2026-02-25
**Context**: InnovatEPAM Portal Phase 1 MVP

## Decision

Use **FastAPI** (Python 3.11+) with **PostgreSQL** and **SQLAlchemy** (async) for the backend API.

## Rationale

| Criterion | FastAPI + PostgreSQL | Alternative (Django + SQLite) |
|-----------|---------------------|-------------------------------|
| Async support | Native async/await | Limited (Django 4.1+) |
| API docs | Auto-generated OpenAPI/Swagger | Manual or DRF |
| Type safety | Pydantic validation built-in | Serializers required |
| Database | Production-grade RDBMS | SQLite not suited for concurrent access |
| ORM | SQLAlchemy (mature, async) | Django ORM (sync-first) |
| Learning curve | Moderate | Lower, but heavier framework |

### Why FastAPI?

- **Automatic OpenAPI docs** — every endpoint is documented and testable via Swagger UI without extra effort.
- **Pydantic schemas** — request/response validation is declarative, reducing boilerplate.
- **Async-first** — native support for async database operations with SQLAlchemy + asyncpg.

### Why PostgreSQL?

- **Production-grade** — supports concurrent connections, transactions, and UUID primary keys natively.
- **EPAM standard** — aligns with enterprise infrastructure expectations.
- **Scalability** — ready for Phase 2+ without migration.

## Consequences

- Developers must understand async/await patterns.
- Requires a running PostgreSQL instance (not file-based like SQLite).
- Alembic is needed for schema migrations.

## Alternatives Considered

1. **Django + DRF**: Heavier framework, sync-first ORM, more boilerplate for REST APIs.
2. **Express.js + MongoDB**: Non-relational DB less suited for structured entity relationships.
3. **Flask + SQLite**: Simpler but lacks async support and production database features.
