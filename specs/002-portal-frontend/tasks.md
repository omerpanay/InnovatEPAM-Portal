# Tasks: InnovatEPAM Portal Frontend

**Input**: Design documents from `/specs/002-portal-frontend/`
**Status**: ✅ ALL TASKS COMPLETE

---

## Phase 1: Setup ✅

- [x] T001 Initialize Vite + React + TypeScript project in `frontend/`
- [x] T002 Install runtime dependencies: `react-router-dom`, `axios`, `react-hook-form`
- [x] T003 [P] Install Tailwind CSS and configure `@tailwindcss/vite` plugin
- [x] T004 [P] Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- [x] T005 [P] Configure Vitest in `frontend/vite.config.ts` with jsdom + pool=forks
- [x] T006 [P] Configure ESLint (default Vite template config)
- [x] T007 Create Tailwind entry styles in `frontend/src/index.css` with dark theme tokens
- [x] T008 Create TypeScript interfaces in `frontend/src/types/index.ts`
- [x] T009 [P] Create constants file `frontend/src/utils/constants.ts`
- [x] T010 Create environment file `frontend/.env`

## Phase 2: Foundation ✅

- [x] T011 Create Axios API client with JWT interceptor in `frontend/src/api/client.ts`
- [x] T012 Create AuthContext provider in `frontend/src/context/AuthContext.tsx`
- [x] T013 Create `useAuth` hook in `frontend/src/hooks/useAuth.ts`
- [x] T014 Create `ProtectedRoute` in `frontend/src/components/ProtectedRoute.tsx`
- [x] T015 Create `Layout` component in `frontend/src/components/Layout.tsx`
- [x] T016 Create `ErrorBanner` in `frontend/src/components/ErrorBanner.tsx`
- [x] T017 Set up React Router in `frontend/src/App.tsx`
- [x] T018 Update `frontend/src/main.tsx` with AuthProvider

## Phase 3: US1 — Login & Registration ✅

- [x] T019 [P] [US1] Write LoginPage test in `frontend/__tests__/LoginPage.test.tsx`
- [x] T020 [P] [US1] Write RegisterPage test (covered in LoginPage test)
- [x] T021 [US1] Create `LoginPage` in `frontend/src/pages/LoginPage.tsx`
- [x] T022 [US1] Create `RegisterPage` in `frontend/src/pages/RegisterPage.tsx`
- [x] T023 [US1] Wire login + register routes in `App.tsx`
- [x] T024 [US1] Verify tests pass ✅ (5 tests)

## Phase 4: US2 — Dashboard ✅

- [x] T025 [P] [US2] Write DashboardPage test in `frontend/__tests__/DashboardPage.test.tsx`
- [x] T026 [P] [US2] Create `StatusBadge` in `frontend/src/components/StatusBadge.tsx`
- [x] T027 [P] [US2] Create `Pagination` in `frontend/src/components/Pagination.tsx`
- [x] T028 [US2] Create `IdeaCard` in `frontend/src/components/IdeaCard.tsx`
- [x] T029 [US2] Create `useIdeas` hook in `frontend/src/hooks/useIdeas.ts`
- [x] T030 [US2] Create `DashboardPage` in `frontend/src/pages/DashboardPage.tsx`
- [x] T031 [US2] Wire dashboard route in `App.tsx`
- [x] T032 [US2] Verify tests pass ✅ (5 tests)

## Phase 5: US3 — Submit Idea ✅

- [x] T033 [P] [US3] Write IdeaForm test in `frontend/__tests__/IdeaForm.test.tsx`
- [x] T034 [US3] Create `IdeaForm` in `frontend/src/components/IdeaForm.tsx`
- [x] T035 [US3] Add client-side file validation (5 MB, extensions) in `IdeaForm.tsx`
- [x] T036 [US3] Integrate form into DashboardPage
- [x] T037 [US3] Wire multipart/form-data POST via API client
- [x] T038 [US3] Verify tests pass ✅ (4 tests)

## Phase 6: US4 — Idea Detail ✅

- [x] T039 [US4] Create `IdeaDetailPage` in `frontend/src/pages/IdeaDetailPage.tsx`
- [x] T040 [US4] Wire `/ideas/:id` route in `App.tsx`
- [x] T041 [US4] Add click-through from `IdeaCard` to detail page

## Phase 7: US5 — Evaluate Idea ✅

- [x] T042 [US5] Create `EvaluationPanel` in `frontend/src/components/EvaluationPanel.tsx`
- [x] T043 [US5] Integrate `EvaluationPanel` into `IdeaDetailPage` with role/status checks
- [x] T044 [US5] Wire POST /ideas/:id/evaluate, refresh on success

## Phase 8: US6 — Role-Based UI ✅

- [x] T045 [US6] Add role-based "New Idea" button visibility in `DashboardPage`
- [x] T046 [US6] Hide `EvaluationPanel` for non-evaluators in `IdeaDetailPage`
- [x] T047 [US6] Show role indicator in `Layout` navbar

## Phase 9: Polish ✅

- [x] T048 [P] Create `NotFoundPage` in `frontend/src/pages/NotFoundPage.tsx`
- [x] T049 Add 404 route in `App.tsx`
- [x] T050 Token expiry handling (401 interceptor → redirect)
- [x] T051 [P] Loading spinners on DashboardPage and IdeaDetailPage
- [x] T052 Responsive layout (Tailwind responsive classes)
- [x] T053 [P] Frontend project documented in quickstart.md
- [x] T054 Final test run: all 14 tests pass ✅

---

## Verification Results

- **Build**: `npm run build` → 110 modules, 0 errors
- **Tests**: `npx vitest run` → 14 tests pass, 0 failures
- **Test coverage**:
  - `LoginPage.test.tsx` — 5 tests (render, validation, submit, error, link)
  - `DashboardPage.test.tsx` — 5 tests (loading, cards, empty, role visibility)
  - `IdeaForm.test.tsx` — 4 tests (fields, validation, submit, cancel)
