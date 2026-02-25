# Project Summary — InnovatEPAM Portal

## Overview

**InnovatEPAM Portal** is a full-stack innovation management platform that enables EPAM employees to submit, browse, and evaluate ideas for process improvements, product innovations, and technology enhancements. The system supports two user roles — **Submitters** who propose ideas and **Evaluators** who review and decide on them.

The project was developed as a Phase 1 MVP using a **Spec-Driven Development (SDD)** methodology, following a structured lifecycle: Specify → Plan → Tasks → Implement → Validate. Every feature went through formal specification, planning, and task generation before any code was written.

| Attribute         | Detail                                          |
|-------------------|------------------------------------------------|
| **Project Name**  | InnovatEPAM Portal                              |
| **Phase**         | Phase 1 — MVP                                   |
| **Backend**       | FastAPI + PostgreSQL + SQLAlchemy (async)        |
| **Frontend**      | React 19 + TypeScript + Vite + Tailwind CSS     |
| **Auth**          | JWT with token blocklist                        |
| **Design System** | EPAM Corporate (black, cyan #00AEEF, sharp UI)  |

---

## Features Completed

### Backend (FastAPI REST API)

| Feature                  | Endpoints                                      | Status |
|--------------------------|-----------------------------------------------|--------|
| User Registration        | `POST /api/v1/auth/register`                   | ✅     |
| User Login               | `POST /api/v1/auth/login`                      | ✅     |
| Token Logout             | `POST /api/v1/auth/logout`                     | ✅     |
| List Ideas (paginated)   | `GET /api/v1/ideas`                            | ✅     |
| Create Idea              | `POST /api/v1/ideas`                           | ✅     |
| Get Idea Detail          | `GET /api/v1/ideas/{id}`                       | ✅     |
| Download Attachment      | `GET /api/v1/ideas/{id}/attachment`             | ✅     |
| Evaluate Idea            | `POST /api/v1/ideas/{id}/evaluate`             | ✅     |
| Role Promotion           | `PATCH /api/v1/users/{id}/role`                | ✅     |
| Role-Based Access Control| Dependency-injected via `require_role()`       | ✅     |

### Frontend (React SPA)

| Feature                  | Component(s)                                    | Status |
|--------------------------|------------------------------------------------|--------|
| Login Page               | `LoginPage.tsx`                                 | ✅     |
| Registration Page        | `RegisterPage.tsx`                              | ✅     |
| JWT Auth Context         | `AuthContext.tsx`, `useAuth.ts`                 | ✅     |
| Protected Routes         | `ProtectedRoute.tsx`                            | ✅     |
| Ideas Dashboard          | `DashboardPage.tsx`, `IdeaCard.tsx`             | ✅     |
| Status & My Ideas Filter | `DashboardPage.tsx`, `useIdeas.ts`              | ✅     |
| Pagination               | `Pagination.tsx`                                | ✅     |
| Idea Submission Form     | `IdeaForm.tsx` (with file validation)           | ✅     |
| Idea Detail View         | `IdeaDetailPage.tsx`                            | ✅     |
| Evaluation Panel         | `EvaluationPanel.tsx`                           | ✅     |
| Role-Based UI            | Conditional rendering by `user.role`            | ✅     |
| EPAM Design System       | `index.css` (black/cyan/industrial)             | ✅     |
| 404 Not Found Page       | `NotFoundPage.tsx`                              | ✅     |
| Token Expiry Handling    | Axios interceptor → auto-redirect              | ✅     |

---

## Technical Stack

| Layer               | Technology                                    |
|---------------------|----------------------------------------------|
| **Backend Language**| Python 3.11+                                  |
| **Backend Framework**| FastAPI (async)                              |
| **Database**        | PostgreSQL                                    |
| **ORM**             | SQLAlchemy (async sessions)                   |
| **Authentication**  | JWT (python-jose) with token blocklist        |
| **Password Hashing**| bcrypt via passlib                            |
| **Frontend Framework**| React 19 (functional components + hooks)   |
| **Frontend Language**| TypeScript (strict mode)                     |
| **Build Tool**      | Vite 7                                        |
| **Styling**         | Tailwind CSS 4 with custom EPAM theme         |
| **API Client**      | Axios with JWT interceptor                    |
| **Routing**         | React Router 7                                |
| **Forms**           | React Hook Form                               |
| **Backend Testing** | pytest + httpx (async)                        |
| **Frontend Testing**| Vitest + React Testing Library                |
| **API Docs**        | OpenAPI/Swagger (auto-generated by FastAPI)    |

### MCP Tools (Module 05)

The following **Model Context Protocol (MCP)** servers were integrated into the AI-assisted development workflow:

| MCP Server | Purpose | Usage |
|------------|---------|-------|
| **PostgreSQL MCP** | Direct database queries | Schema verification, data inspection during development |
| **Sequential Thinking MCP** | Structured problem decomposition | Breaking down complex features into implementation steps |
| **Context7 MCP** | Library documentation lookup | Querying up-to-date docs for React, FastAPI, Tailwind CSS |

### Architecture

```
EpamPortal/
├── app/                    # Backend (FastAPI)
│   ├── routers/            # API endpoint handlers
│   ├── models/             # SQLAlchemy ORM models
│   ├── schemas/            # Pydantic request/response schemas
│   ├── services/           # Business logic layer
│   ├── dependencies/       # Auth guards & DB session
│   ├── main.py             # App entry point + CORS
│   └── database.py         # Async engine & session
├── tests/                  # Backend pytest tests
├── frontend/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # Auth context provider
│   │   ├── api/            # Axios client
│   │   ├── types/          # TypeScript interfaces
│   │   └── utils/          # Constants & helpers
│   └── __tests__/          # Frontend test suites
└── specs/                  # Specification artifacts
```

---

## Test Coverage

### Backend Tests (pytest)

| Test File              | Focus Area                        | Test Count |
|------------------------|-----------------------------------|-----------|
| `test_auth.py`         | Registration, login, logout, JWT  | ~10       |
| `test_ideas.py`        | CRUD, pagination, filtering       | ~10       |
| `test_evaluations.py`  | Accept/reject, role enforcement   | ~8        |
| `test_users.py`        | Role promotion, access control    | ~6        |
| **Total**              |                                   | **34**    |

### Frontend Tests (Vitest)

| Test File                   | Focus Area                          | Test Count |
|-----------------------------|-------------------------------------|-----------|
| `LoginPage.test.tsx`        | Render, validation, submit, error, navigation | 5  |
| `DashboardPage.test.tsx`    | Loading, cards, empty state, role UI, status filter | 6 |
| `IdeaForm.test.tsx`         | Fields, validation, API submit, cancel | 4        |
| **Total**                   |                                     | **15**    |

### Combined Verification

| Check                     | Result                              |
|---------------------------|-------------------------------------|
| Backend tests (pytest)    | ✅ 34 passed                        |
| Frontend tests (vitest)   | ✅ 15 passed                        |
| TypeScript build          | ✅ 110 modules, 0 errors            |
| Production bundle size    | ✅ 314 KB JS (102 KB gzipped)       |
| **Total test count**      | **49 tests**                        |

---

## Transformation Reflection

### Before (Module 01)

- Development started with **ad-hoc coding** — jumping directly into implementation without formal requirements or planning.
- No structured specification process; features were defined informally and evolved during coding.
- Testing was an **afterthought** — written (if at all) after the feature was already built, leading to gaps in edge-case coverage.
- No formal **project constitution** or guiding principles; decisions were made case-by-case without a consistent framework.
- Architecture emerged **organically** rather than through deliberate design, resulting in tight coupling between components.
- No **role-based access control** design — security concerns were patched in reactively.
- Frontend and backend developed without clear **API contracts**, causing integration mismatches (e.g., parameter naming inconsistencies like `status` vs `idea_status`).

### After (Module 08)

- Every feature follows a rigorous **Spec-Driven Development (SDD)** lifecycle: Specify → Plan → Tasks → Implement → Validate.
- A formal **Project Constitution** (v1.1.0) enforces 4 core principles: SDD, TDD, Architectural Integrity, and YAGNI.
- **Test-Driven Development (TDD)** is mandatory — 49 automated tests cover both backend endpoints and frontend user flows with mocked API calls.
- Clean **layered architecture**: Routers → Services → Models with dependency injection and Single Responsibility Principle.
- **Role-Based Access Control** is designed into the architecture from the start, using JWT claims and dependency-injected guards (`require_role()`).
- Frontend-backend integration is governed by **typed API contracts** — TypeScript interfaces on the frontend mirror Pydantic schemas on the backend.
- A dedicated **EPAM corporate design system** ensures visual consistency and brand alignment across all UI components.
- **Automated verification pipeline**: `pytest` + `vitest` + `tsc --noEmit` + `vite build` — all passing with zero errors.
- **MCP tools** accelerate development — PostgreSQL MCP for live schema queries, Sequential Thinking for structured problem-solving, Context7 for instant library documentation.

### Key Learning

1. **Specification-first development prevents integration bugs.** The status filter bug (`status` vs `idea_status`) happened in the only area where the frontend was implemented slightly ahead of formal contract alignment. A spec-driven approach with explicit API contracts would have caught this mismatch at design time, not runtime.

2. **TDD creates a safety net for refactoring.** When we completely rewrote all 14 frontend components for the EPAM design refresh, having 15 pre-existing tests immediately caught that 2 button labels had changed (`Submit Idea` → `SUBMIT`). Without tests, this silent breakage could have shipped unnoticed.

3. **A project constitution is a force multiplier.** The constitution's engineering standards (functional components, typed props, PascalCase files, mocked API calls in tests) eliminated subjective code review debates and produced a codebase where any file feels consistent with every other file.

4. **Clean architecture pays dividends immediately.** The layered Backend architecture (Routers → Services → Models) with dependency injection made it trivial to add the evaluation feature — the service layer was independently testable, and the router was a thin wrapper calling it.

5. **YAGNI keeps the codebase lean.** By strictly implementing only what was specified, the Phase 1 MVP was completed as a focused 47-file project (25 backend + 22 frontend) rather than an over-engineered framework. Every line of code has a traceable requirement behind it.

---

**Author**: Ömer Panay
**Date**: 2026-02-25
**Course**: A201 — EPAM AI BOOTCAMP
