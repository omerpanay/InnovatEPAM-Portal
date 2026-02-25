# Research: InnovatEPAM Portal Frontend

**Date**: 2026-02-25
**Feature**: `002-portal-frontend`

## Decision Log

### 1. Bundler & Dev Server

- **Decision**: Vite 6.x
- **Rationale**: Fastest cold-start, native ESM HMR, first-class React/TS
  support. Constitution mandates "React initialized via Vite".
- **Alternatives**: CRA (deprecated), Next.js (SSR not needed for internal
  portal), Webpack (slower DX).

### 2. State Management

- **Decision**: React Context + `useReducer` for auth; local state + custom
  hooks for everything else.
- **Rationale**: YAGNI principle — no global store needed for 6 pages.
  Auth context provides token/role to all routes.
- **Alternatives**: Redux Toolkit (too heavy), Zustand (extra dep for small
  scope), Jotai (atomic model unnecessary).

### 3. HTTP Client

- **Decision**: `axios` with a centralized API client module.
- **Rationale**: Built-in interceptors simplify JWT injection & 401
  auto-redirect. Cleaner than wrapping raw `fetch`.
- **Alternatives**: `fetch` (requires manual boilerplate for interceptors),
  `ky` (less adopted).

### 4. Routing

- **Decision**: React Router v7 (`react-router-dom`).
- **Rationale**: De-facto standard for SPA routing. Supports protected
  route wrappers and lazy loading.
- **Alternatives**: TanStack Router (newer, smaller community).

### 5. Form Handling

- **Decision**: React Hook Form + native HTML validation.
- **Rationale**: Minimal re-renders, built-in validation, good TS support.
  File upload handling is straightforward.
- **Alternatives**: Formik (heavier), uncontrolled forms (no validation UX).

### 6. Testing Strategy

- **Decision**: Vitest + React Testing Library.
- **Rationale**: Constitution mandates frontend tests. Vitest is Vite-native,
  zero-config. RTL encourages user-centric tests.
- **Alternatives**: Jest (needs separate config with Vite), Cypress
  (E2E scope, heavier setup).

### 7. Styling Approach

- **Decision**: Tailwind CSS v3 with `@tailwindcss/forms` plugin.
- **Rationale**: Constitution mandates Tailwind. The forms plugin provides
  consistent baseline for inputs/selects.
- **Alternatives**: CSS Modules (allowed by Tailwind as escape hatch).

### 8. JWT Storage

- **Decision**: `localStorage` for token persistence.
- **Rationale**: Simple, persists across tabs. Internal portal with CORS
  protection minimizes XSS risk. httpOnly cookies would require backend
  changes out of scope.
- **Alternatives**: sessionStorage (lost on tab close), cookies (needs
  backend changes).
