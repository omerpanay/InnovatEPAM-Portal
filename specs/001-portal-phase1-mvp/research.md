# Research: InnovatEPAM Portal — Phase 1 MVP

**Branch**: `001-portal-phase1-mvp`
**Date**: 2026-02-25

## Overview

All technical decisions for Phase 1 are resolved from the ratified
constitution (v1.0.0) and the approved feature specification. This
document records the decisions, rationale, and alternatives considered.

---

## R1: Web Framework

**Decision**: FastAPI
**Rationale**: Mandated by the constitution. Async-capable, automatic
OpenAPI docs, native Pydantic validation, dependency injection built-in.
**Alternatives considered**:

- Django REST Framework — heavier, synchronous by default, not in the
  constitution's tech stack.
- Flask — no built-in validation or DI, more boilerplate.

---

## R2: ORM & Database Migrations

**Decision**: SQLAlchemy 2.x + Alembic
**Rationale**: Constitution mandates SQLAlchemy. Version 2.x provides
the modern `Mapped` type-hint syntax. Alembic is the de facto migration
tool for SQLAlchemy.
**Alternatives considered**:

- Tortoise ORM — async-first but not in the constitution.
- Raw SQL — violates DRY and lacks migration tracking.

---

## R3: Authentication Strategy

**Decision**: JWT with `python-jose` + passlib[bcrypt]
**Rationale**: Constitution mandates JWT. `python-jose` is lightweight
and widely used with FastAPI. Bcrypt is the industry standard for
password hashing.
**Alternatives considered**:

- PyJWT — viable but `python-jose` has built-in JWS/JWE support.
- Argon2 — excellent for hashing but bcrypt is simpler and has better
  FastAPI ecosystem examples.

---

## R4: Token Invalidation (Logout)

**Decision**: Token blocklist (in-memory set for Phase 1)
**Rationale**: JWTs are stateless; the simplest invalidation mechanism
is a blocklist checked on every authenticated request. An in-memory set
is sufficient for Phase 1 scale (~100 users). A database-backed
blocklist can be added in a future phase.
**Alternatives considered**:

- Short-lived tokens only (no blocklist) — spec requires explicit
  logout (FR-005).
- Redis-backed blocklist — over-engineering for Phase 1 (YAGNI).

---

## R5: File Upload Strategy

**Decision**: Local filesystem storage under `app/uploads/`
**Rationale**: Spec assumption states local storage for Phase 1.
FastAPI's `UploadFile` provides streaming multipart support.
Max size enforced at the router level (5 MB).
**Alternatives considered**:

- S3/MinIO — deferred to future phase per spec assumptions.
- Database BLOB — poor performance for binary data.

---

## R6: Project Layout

**Decision**: Single-project, flat `app/` package
**Rationale**: Phase 1 is backend-only (~10 endpoints, 3 tables). A
monorepo with `backend/` + `frontend/` is premature (YAGNI). The flat
layout keeps imports simple and pytest discovery straightforward.
**Alternatives considered**:

- Domain-driven packages (`app/auth/`, `app/ideas/`) — viable at
  larger scale but adds indirection for 3 domains.

---

## R7: Testing Strategy

**Decision**: pytest + httpx TestClient, SQLite in-memory for test DB
**Rationale**: Constitution mandates pytest. `httpx.AsyncClient` or
FastAPI's `TestClient` integrates natively. SQLite in-memory is fast
for unit/contract tests; a Docker PostgreSQL can be used for integration
tests.
**Alternatives considered**:

- Testcontainers (Docker PostgreSQL) — heavier, slower CI; better
  suited for integration test phase.

---

## R8: Pagination

**Decision**: Offset-based pagination with `skip` + `limit` query params
**Rationale**: Simplest approach for Phase 1. Default limit = 20
(per spec assumptions). Cursor-based pagination is deferred (YAGNI).
**Alternatives considered**:

- Cursor-based — more efficient for large datasets but over-engineering
  for MVP.

---

## R9: Linting & Formatting

**Decision**: Ruff (linter + formatter)
**Rationale**: Constitution requires PEP 8 compliance. Ruff is a
single tool that replaces flake8, isort, and black with dramatically
faster execution.
**Alternatives considered**:

- flake8 + black + isort — functional but three separate tools.
