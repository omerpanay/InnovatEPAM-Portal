# Tasks: InnovatEPAM Portal — Phase 1 MVP

**Input**: Design documents from `/specs/001-portal-phase1-mvp/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: TDD is mandatory per Constitution Principle II. Every endpoint
has positive + negative test cases. Tests are written FIRST and MUST FAIL
before implementation (Red-Green-Refactor).

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `app/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and basic structure.

- [x] T001 Create project root files: `requirements.txt`, `requirements-dev.txt`, `.env.example`, `.gitignore`
- [x] T002 Create application package structure: `app/__init__.py`, `app/models/__init__.py`, `app/schemas/__init__.py`, `app/services/__init__.py`, `app/routers/__init__.py`, `app/dependencies/__init__.py`
- [x] T003 [P] Implement application settings via pydantic-settings in `app/config.py` (DATABASE_URL, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, UPLOAD_DIR)
- [x] T004 [P] Configure SQLAlchemy engine, Base model, and session factory in `app/database.py`
- [x] T005 [P] Initialize Alembic for database migrations: `alembic/`, `alembic.ini`, `alembic/env.py`
- [x] T006 Create FastAPI application factory with CORS and router registration in `app/main.py`
- [x] T007 [P] Create shared test fixtures in `tests/conftest.py` (TestClient, test DB override, auth helper fixtures)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T008 Implement password hashing (bcrypt) and JWT create/verify utilities in `app/services/auth_service.py`
- [x] T009 [P] Implement `get_current_user` dependency (decode JWT, check blocklist, return user) in `app/dependencies/auth.py`
- [x] T010 [P] Implement `require_role(role)` dependency factory (check user role, raise 403) in `app/dependencies/auth.py`
- [x] T011 [P] Implement `get_db` session dependency in `app/dependencies/auth.py`
- [x] T012 Create User SQLAlchemy model (id, email, username, hashed_password, role, created_at) in `app/models/user.py`
- [x] T013 Generate initial Alembic migration for User table in `alembic/versions/`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — User Registration & Login (Priority: P1) 🎯 MVP

**Goal**: Users can register an account, log in to receive a JWT, and
log out to invalidate the token.

**Independent Test**: A user can register, receive a JWT, log in with
valid credentials, and be rejected with invalid credentials.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T014 [P] [US1] Write positive + negative registration tests in `tests/test_auth.py` (valid registration → 201 + JWT; duplicate email → 400; missing fields → 422)
- [x] T015 [P] [US1] Write positive + negative login tests in `tests/test_auth.py` (valid login → 200 + JWT; wrong password → 401; non-existent email → 401)
- [x] T016 [P] [US1] Write positive + negative logout tests in `tests/test_auth.py` (valid logout → 200; re-use token → 401; no token → 401)

### Implementation for User Story 1

- [x] T017 [P] [US1] Create Pydantic schemas: `RegisterRequest`, `LoginRequest`, `TokenResponse` in `app/schemas/auth.py`
- [x] T018 [US1] Implement `UserService` (create_user, get_by_email) in `app/services/user_service.py`
- [x] T019 [US1] Implement auth router: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout` in `app/routers/auth.py`
- [x] T020 [US1] Register auth router in `app/main.py` and verify all US1 tests pass

**Checkpoint**: User Story 1 fully functional — users can register, login, and logout.

---

## Phase 4: User Story 2 — Role-Based Access (Priority: P1)

**Goal**: Users have distinct roles (submitter vs. evaluator). Admins
can promote users. Role enforcement is applied to protected endpoints.

**Independent Test**: A submitter is blocked from evaluation endpoints
(403); an admin can promote a user's role.

### Tests for User Story 2 ⚠️

- [x] T021 [P] [US2] Write positive + negative role promotion tests in `tests/test_users.py` (admin promotes user → 200; submitter tries → 403; user not found → 404)
- [x] T022 [P] [US2] Write role enforcement tests in `tests/test_users.py` (submitter accesses eval endpoint → 403; evaluator accesses eval endpoint → allowed)

### Implementation for User Story 2

- [x] T023 [P] [US2] Create Pydantic schemas: `UserResponse`, `RoleUpdateRequest` in `app/schemas/user.py`
- [x] T024 [US2] Implement role update logic in `app/services/user_service.py` (update_role method)
- [x] T025 [US2] Implement users router: `PATCH /api/v1/users/{user_id}/role` in `app/routers/users.py`
- [x] T026 [US2] Register users router in `app/main.py` and verify all US2 tests pass

**Checkpoint**: User Stories 1 AND 2 fully functional — auth + role enforcement working.

---

## Phase 5: User Story 3 — Idea Submission (Priority: P1)

**Goal**: Authenticated submitters can submit ideas with title,
description, category, and optional file attachment.

**Independent Test**: A submitter can create an idea with and without
an attachment; invalid inputs are rejected.

### Tests for User Story 3 ⚠️

- [x] T027 [P] [US3] Write positive idea creation tests in `tests/test_ideas.py` (valid idea → 201; idea with attachment → 201 + file stored)
- [x] T028 [P] [US3] Write negative idea creation tests in `tests/test_ideas.py` (missing title → 422; file too large → 400; bad file type → 400; unauthenticated → 401)

### Implementation for User Story 3

- [x] T029 [US3] Create Idea SQLAlchemy model (id, title, description, category, status, author_id, attachment_path, created_at, updated_at) in `app/models/idea.py`
- [x] T030 [US3] Generate Alembic migration for Idea table in `alembic/versions/`
- [x] T031 [P] [US3] Create Pydantic schemas: `IdeaCreateRequest`, `IdeaResponse` in `app/schemas/idea.py`
- [x] T032 [US3] Implement `IdeaService` (create_idea, handle_file_upload) in `app/services/idea_service.py`
- [x] T033 [US3] Implement ideas router: `POST /api/v1/ideas` (multipart/form-data) in `app/routers/ideas.py`
- [x] T034 [US3] Register ideas router in `app/main.py` and verify all US3 tests pass

**Checkpoint**: User Story 3 fully functional — submitters can create ideas with attachments.

---

## Phase 6: User Story 4 — Idea Listing & Viewing (Priority: P2)

**Goal**: Authenticated users can browse a paginated list of ideas and
view any single idea's full details.

**Independent Test**: Retrieve paginated idea list; retrieve single idea
by ID; 404 for non-existent idea.

### Tests for User Story 4 ⚠️

- [x] T035 [P] [US4] Write positive listing tests in `tests/test_ideas.py` (list ideas → 200 + paginated response; get idea by ID → 200 + full detail)
- [x] T036 [P] [US4] Write negative listing tests in `tests/test_ideas.py` (non-existent ID → 404; unauthenticated → 401)

### Implementation for User Story 4

- [x] T037 [P] [US4] Create Pydantic schemas: `IdeaListResponse`, `PaginationParams` in `app/schemas/idea.py`
- [x] T038 [US4] Implement listing and detail methods in `app/services/idea_service.py` (get_ideas with skip/limit/mine/status filters, get_idea_by_id)
- [x] T039 [US4] Implement ideas router endpoints: `GET /api/v1/ideas`, `GET /api/v1/ideas/{idea_id}` in `app/routers/ideas.py`
- [x] T040 [US4] Verify all US4 tests pass

**Checkpoint**: User Stories 1–4 functional — full idea browse experience.

---

## Phase 7: User Story 5 — Idea Evaluation by Admin (Priority: P2)

**Goal**: Evaluators can accept or reject submitted ideas with mandatory
comments. Status is updated and re-evaluation is blocked.

**Independent Test**: An evaluator accepts an idea → status changes;
rejects an idea → status changes; submitter is blocked; re-evaluation
is blocked.

### Tests for User Story 5 ⚠️

- [x] T041 [P] [US5] Write positive evaluation tests in `tests/test_evaluations.py` (accept idea → 201 + status updated; reject idea → 201 + status updated)
- [x] T042 [P] [US5] Write negative evaluation tests in `tests/test_evaluations.py` (missing comment → 400; already evaluated → 400; submitter tries → 403; idea not found → 404)

### Implementation for User Story 5

- [x] T043 [US5] Create Evaluation SQLAlchemy model (id, idea_id, evaluator_id, decision, comment, created_at) in `app/models/evaluation.py`
- [x] T044 [US5] Generate Alembic migration for Evaluation table in `alembic/versions/`
- [x] T045 [P] [US5] Create Pydantic schemas: `EvaluationCreateRequest`, `EvaluationResponse` in `app/schemas/evaluation.py`
- [x] T046 [US5] Implement `EvaluationService` (evaluate_idea: validate status, create evaluation, update idea status) in `app/services/evaluation_service.py`
- [x] T047 [US5] Implement evaluations router: `POST /api/v1/ideas/{idea_id}/evaluate` in `app/routers/evaluations.py`
- [x] T048 [US5] Register evaluations router in `app/main.py` and verify all US5 tests pass

**Checkpoint**: User Stories 1–5 functional — complete submit + evaluate lifecycle.

---

## Phase 8: User Story 6 — Idea Status Tracking (Priority: P3)

**Goal**: Submitters can filter their own ideas and see evaluation
details (status + comment) on evaluated ideas.

**Independent Test**: A submitter retrieves only their own ideas; an
evaluated idea shows the evaluator's comment.

### Tests for User Story 6 ⚠️

- [x] T049 [P] [US6] Write positive filtering tests in `tests/test_ideas.py` (mine=true → only own ideas; evaluated idea detail includes evaluation comment)
- [x] T050 [P] [US6] Write negative filtering tests in `tests/test_ideas.py` (mine=true with no ideas → empty list)

### Implementation for User Story 6

- [x] T051 [US6] Add `mine` query filter and evaluation embedding to idea detail in `app/services/idea_service.py`
- [x] T052 [US6] Update `GET /api/v1/ideas` and `GET /api/v1/ideas/{id}` responses to include evaluation data in `app/routers/ideas.py`
- [x] T053 [US6] Verify all US6 tests pass

**Checkpoint**: All user stories functional — complete idea lifecycle with status tracking.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [x] T054 [P] Add module-level docstrings to all `app/` modules per Constitution Engineering Standards
- [x] T055 [P] Run ruff linter and formatter across `app/` and `tests/` — fix all violations
- [x] T056 [P] Add OpenAPI summary and description metadata to all FastAPI endpoints in `app/routers/`
- [x] T057 Run full test suite with coverage: `pytest --cov=app --cov-report=term-missing` — target ≥ 90%
- [x] T058 [P] Create `README.md` at project root with project overview, setup instructions, and link to quickstart.md
- [x] T059 Run `quickstart.md` validation — verify a fresh setup works end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (Phase 2)
- **US2 (Phase 4)**: Depends on Foundational (Phase 2) — can run parallel with US1
- **US3 (Phase 5)**: Depends on Foundational (Phase 2) — can run parallel with US1/US2
- **US4 (Phase 6)**: Depends on US3 (needs Idea model & service)
- **US5 (Phase 7)**: Depends on US3 (needs Idea model & service)
- **US6 (Phase 8)**: Depends on US4 + US5 (needs listing + evaluation)
- **Polish (Phase 9)**: Depends on all user stories being complete

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD — Constitution Principle II)
- Models → Services → Endpoints → Integration
- Story complete before moving to next priority (unless parallelizing)

### Parallel Opportunities

```text
Phase 1:  T003 ═══╗
          T004 ═══╬══ All run in parallel
          T005 ═══╣
          T007 ═══╝

Phase 2:  T009 ═══╗
          T010 ═══╬══ After T008
          T011 ═══╝

Phase 3:  T014 ═══╗              T017 (parallel with tests)
          T015 ═══╬══ Tests       │
          T016 ═══╝              T018 → T019 → T020

Phase 5:  T027 ═══╗              T031 (parallel with tests)
          T028 ═══╝              T029 → T030 → T032 → T033 → T034

Phase 6+7 can run in parallel (both depend on US3 only):
  Phase 6: T035 ║ T036 → T037 → T038 → T039 → T040
  Phase 7: T041 ║ T042 → T043 → T044 → T045 → T046 → T047 → T048
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Registration & Login)
4. **STOP and VALIDATE**: Test US1 independently
5. Deploy/demo if ready — users can register and authenticate

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Auth) → Test → Deploy (MVP!)
3. Add US2 (Roles) → Test → Deploy
4. Add US3 (Idea Submission) → Test → Deploy
5. Add US4 (Idea Listing) + US5 (Evaluation) → Test → Deploy (parallel)
6. Add US6 (Status Tracking) → Test → Deploy
7. Polish phase → Final QA → Release

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (Red phase)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
