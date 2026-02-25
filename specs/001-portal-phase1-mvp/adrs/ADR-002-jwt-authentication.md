# ADR-002: JWT Authentication Strategy

**Status**: Accepted
**Date**: 2026-02-25
**Context**: InnovatEPAM Portal Phase 1 MVP — User Authentication

## Decision

Use **JWT (JSON Web Tokens)** with a **token blocklist** for authentication and session management.

## Rationale

| Criterion | JWT + Blocklist | Alternative (Session Cookies) |
|-----------|----------------|-------------------------------|
| Statelessness | Stateless (except blocklist) | Server-side session store |
| Frontend integration | Simple `Authorization` header | Cookie management complexity |
| SPA compatibility | Excellent | CSRF protection required |
| Role embedding | Claims in token payload | Separate DB lookup per request |
| Scalability | Horizontal (no shared state) | Sticky sessions or shared store |

### Design Decisions

1. **Token payload**: Contains `sub` (user ID) and `role` (submitter/evaluator) claims — avoids an extra DB query on every request.
2. **Token blocklist**: In-memory `set()` for Phase 1 MVP. Enables proper logout by invalidating tokens before expiry.
3. **Password hashing**: bcrypt via `passlib` — industry standard, resistant to rainbow table attacks.
4. **Token storage (frontend)**: `localStorage` — acceptable for MVP; `httpOnly` cookies would be preferred for production.

### Token Flow

```
Register/Login → Server issues JWT (with role claim)
    → Frontend stores in localStorage
    → Axios interceptor adds Authorization: Bearer <token>
    → Backend validates token via dependency injection
    → On 401 → Frontend clears token, redirects to /login
    → On Logout → Token added to blocklist
```

## Consequences

- In-memory blocklist is lost on server restart (acceptable for MVP).
- Token expiry is set to 30 minutes; no refresh token mechanism in Phase 1.
- Frontend must handle 401 responses gracefully (auto-redirect).

## Alternatives Considered

1. **Session cookies**: More secure against XSS but requires CSRF protection and doesn't align well with SPA architecture.
2. **OAuth 2.0 / OpenID Connect**: Overkill for an internal MVP; adds external IdP dependency.
3. **API keys**: No user identity management; not suitable for role-based access.
