# Implementation Plan: InnovatEPAM Portal Frontend

**Branch**: `002-portal-frontend` | **Date**: 2026-02-25 | **Spec**: [spec.md](file:///c:/new/EpamPortal/specs/002-portal-frontend/spec.md)
**Input**: Feature specification from `/specs/002-portal-frontend/spec.md`

## Summary

Build a React SPA that serves as the frontend for the InnovatEPAM Portal. The
application connects to the existing FastAPI backend (`/api/v1`) and provides:
login/registration, an ideas dashboard with pagination and filtering, idea
submission with file upload, idea detail view, and an evaluator panel with
role-based visibility. The frontend is initialized with Vite, styled with
Tailwind CSS, and tested with Vitest + React Testing Library.

## Technical Context

**Language/Version**: TypeScript 5.x (Node 18+)
**Primary Dependencies**: React 19, React Router 7, Axios, React Hook Form
**Storage**: localStorage (JWT token only)
**Testing**: Vitest + React Testing Library
**Target Platform**: Modern browsers (Chrome, Firefox, Edge, Safari latest)
**Project Type**: Single-page web application (SPA)
**Performance Goals**: Dashboard renders ≤ 2s, all pages interactive ≤ 1s
**Constraints**: Must work with existing backend without backend changes
**Scale/Scope**: 6 pages, ~15 components, ~3 custom hooks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. SDD** | ✅ PASS | Full lifecycle: spec → plan → tasks → implement |
| **II. TDD** | ✅ PASS | Vitest + RTL test plan for each page/component |
| **III. Arch Integrity** | ✅ PASS | SRP: api/, context/, components/, pages/ separated; no circular deps |
| **IV. YAGNI** | ✅ PASS | No Redux, no SSR, no i18n — only spec'd features |
| **Frontend Stack** | ✅ PASS | React/Vite, Tailwind, TypeScript, axios, Context+hooks |
| **Folder Structure** | ✅ PASS | `/frontend` at project root, independent from `/app` |
| **Code Style** | ✅ PASS | ESLint, PascalCase components, camelCase utils, TS types |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-portal-frontend/
├── spec.md
├── plan.md              # This file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md             # (created by /speckit.tasks)
```

### Source Code (repository root)

```text
app/                     # ← Existing backend (unchanged)
├── routers/
├── services/
├── models/
└── schemas/

frontend/                # ← NEW: React SPA
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
├── .env
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css              # Tailwind directives
│   ├── api/
│   │   └── client.ts          # Axios instance + interceptors
│   ├── context/
│   │   └── AuthContext.tsx     # Auth state provider
│   ├── components/
│   │   ├── Layout.tsx          # Navbar + page wrapper
│   │   ├── ProtectedRoute.tsx  # Auth guard (redirects to /login)
│   │   ├── IdeaCard.tsx        # Dashboard idea card
│   │   ├── IdeaForm.tsx        # Create-idea modal/form
│   │   ├── EvaluationPanel.tsx # Evaluator decision form
│   │   ├── StatusBadge.tsx     # Colored status pill
│   │   ├── Pagination.tsx      # Prev/Next controls
│   │   └── ErrorBanner.tsx     # API error display
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── IdeaDetailPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── hooks/
│   │   ├── useIdeas.ts         # Ideas fetch + filter logic
│   │   └── useAuth.ts          # AuthContext convenience hook
│   ├── types/
│   │   └── index.ts            # Shared TypeScript interfaces
│   └── utils/
│       └── constants.ts        # Category labels, route paths
└── __tests__/
    ├── LoginPage.test.tsx
    ├── DashboardPage.test.tsx
    └── IdeaForm.test.tsx
```

**Structure Decision**: Web application layout (Option 2 from template).
Backend stays in `/app`, frontend in `/frontend`. Both are independently
developed and deployed. CORS is already configured in the backend.

## Implementation Phases

### Phase 1: Setup (shared infra)

1. Initialize Vite+React+TS project in `frontend/`
2. Install dependencies: `react-router-dom`, `axios`, `react-hook-form`,
   `tailwindcss`, `@tailwindcss/forms`, `vitest`, `@testing-library/react`
3. Configure Tailwind, PostCSS, ESLint, Vitest
4. Create `src/types/index.ts` with all TypeScript interfaces
5. Create `src/utils/constants.ts` with routes and category labels
6. Create `.env` with `VITE_API_BASE_URL`

### Phase 2: Auth (US1 — P1)

1. Create `src/api/client.ts` (axios instance, JWT interceptor, 401 handler)
2. Create `src/context/AuthContext.tsx` (login, register, logout, token
   persistence)
3. Create `LoginPage.tsx` and `RegisterPage.tsx` with React Hook Form
4. Create `ProtectedRoute.tsx` component
5. Wire routing in `App.tsx`
6. Write tests for login/register flows

### Phase 3: Dashboard (US2 — P1)

1. Create `IdeaCard.tsx`, `StatusBadge.tsx`, `Pagination.tsx`
2. Create `useIdeas.ts` hook (GET /ideas with params)
3. Create `DashboardPage.tsx` with filter controls
4. Create `Layout.tsx` (navbar with user info + logout)
5. Write `DashboardPage.test.tsx`

### Phase 4: Idea Submission (US3 — P2)

1. Create `IdeaForm.tsx` (multipart/form-data, file validation)
2. Integrate form into dashboard (modal or separate route)
3. Write form validation tests

### Phase 5: Detail & Evaluation (US4 + US5 — P2/P3)

1. Create `IdeaDetailPage.tsx` (GET /ideas/:id)
2. Create `EvaluationPanel.tsx` (POST /ideas/:id/evaluate)
3. Role-based panel visibility logic
4. Write detail page + evaluation tests

### Phase 6: Polish (US6 + edge cases)

1. Role-based button visibility across all pages
2. `ErrorBanner.tsx` + `NotFoundPage.tsx`
3. Token expiry handling (401 interceptor)
4. Responsive layout audit
5. Final test run

## Verification Plan

### Automated Tests

All tests run via `cd frontend && npm run test`:

| Test File                  | Covers                              |
|----------------------------|-------------------------------------|
| `LoginPage.test.tsx`       | Login form render, submit, error    |
| `DashboardPage.test.tsx`   | List render, filters, pagination    |
| `IdeaForm.test.tsx`        | Form validation, file checks        |

Tests mock API calls with `vi.mock('axios')` — no running backend required.

### Browser Verification

Use the browser subagent after implementation to verify:

1. Navigate to `http://localhost:5173` — should redirect to login
2. Register a new user → should redirect to dashboard
3. Submit an idea → should appear in the list
4. Click idea card → detail page renders
5. Log in as evaluator → evaluate an idea → status updates

### Manual Verification (user)

After implementation, the user can:

1. Run `cd frontend && npm run dev`
2. Open `http://localhost:5173` in browser
3. Register, submit an idea, log out
4. Use the existing `promote_user.py` script to make a user an evaluator
5. Log in as evaluator and evaluate the idea
6. Confirm role-based UI (no "New Idea" button for evaluator)
