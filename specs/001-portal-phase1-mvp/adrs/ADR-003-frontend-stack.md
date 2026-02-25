# ADR-003: Frontend Technology Stack

**Status**: Accepted
**Date**: 2026-02-25
**Context**: InnovatEPAM Portal Phase 1 MVP — Frontend Web Application

## Decision

Use **React 19** (via **Vite**) with **TypeScript** and **Tailwind CSS** for the frontend SPA.

## Rationale

| Criterion | React + Vite + Tailwind | Alternative (Next.js) | Alternative (Vue + Nuxt) |
|-----------|------------------------|----------------------|-------------------------|
| Build speed | ~1.5s production build | Slower (SSR overhead) | Comparable |
| Bundle size | 314 KB (102 KB gzip) | Larger (framework overhead) | Comparable |
| SPA suitability | Pure client-side SPA | SSR/SSG overhead unnecessary | Good |
| TypeScript | First-class support | First-class support | Good via Vue 3 |
| Styling | Utility-first, fast iteration | Same (Tailwind compatible) | Same |
| Learning curve | Team familiarity | Additional SSR concepts | New framework |

### Why Vite (not Create React App)?

- **CRA is deprecated** — no longer maintained by React team.
- **HMR speed** — Vite's native ES module dev server is significantly faster.
- **Plugin ecosystem** — `@tailwindcss/vite` integration is seamless.

### Why Tailwind CSS?

- **Rapid prototyping** — utility classes eliminate context-switching between TSX and CSS files.
- **EPAM brand customization** — custom theme tokens (colors, spacing) via `@theme` directive.
- **No unused CSS** — tree-shaking produces minimal production bundles (24.8 KB CSS).

### Why NOT Next.js?

- The portal is a **pure SPA** — no server-side rendering, no SEO requirements for authenticated pages.
- Adding SSR complexity violates the **YAGNI** principle (Constitution Principle IV).

### State Management

- **React Context API** for global auth state — avoids Redux/Zustand overhead.
- **Custom hooks** (`useIdeas`, `useAuth`) for data fetching — simple, composable, testable.
- This aligns with Constitution Principle IV (YAGNI) — no state management library needed for MVP scope.

## Consequences

- No server-side rendering — all pages require JavaScript to render.
- Frontend and backend are fully decoupled — CORS must be configured.
- Tailwind utility classes can lead to long `className` strings (mitigated by component extraction).

## Alternatives Considered

1. **Next.js**: SSR/SSG capabilities are unnecessary for an authenticated SPA. Adds complexity without benefit.
2. **Vue 3 + Nuxt**: Viable alternative but team has more React experience.
3. **Angular**: Heavier framework with more boilerplate; overkill for MVP scope.
4. **Vanilla HTML/CSS/JS**: Not maintainable at the component complexity level required.
