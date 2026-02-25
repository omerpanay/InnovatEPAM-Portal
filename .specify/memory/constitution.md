<!--
  Sync Impact Report
  ==================
  Version change: 1.0.0 → 1.1.0 (MINOR — new section added)
  Modified principles: None (all 4 principles unchanged)
  Added sections:
    - Technology Stack → Frontend sub-table
    - Engineering Standards → Frontend Code Style
    - Engineering Standards → Frontend Testing
  Removed sections: None
  Templates requiring updates:
    - plan-template.md    ✅ Compatible (already has "Option 2: Web application" structure)
    - spec-template.md    ✅ Compatible (user stories are stack-agnostic)
    - tasks-template.md   ✅ Compatible (already has frontend/ path convention)
  Follow-up TODOs: None
-->

# InnovatEPAM Portal Constitution

## Core Principles

### I. Spec-Driven Development (SDD)

Direct coding is **prohibited**. Every feature MUST follow the full
specification lifecycle before any implementation begins:

1. **Specify** — Define requirements, user stories, and acceptance criteria.
2. **Plan** — Produce an implementation plan with technical context and
   design decisions.
3. **Tasks** — Break the plan into dependency-ordered, independently
   testable tasks.
4. **Implement** — Write code only after tasks are approved.
5. **Validate** — Verify the implementation against the specification
   and acceptance criteria.

Skipping or reordering any phase is a governance violation.

### II. Test-Driven Development (TDD)

The **Red-Green-Refactor** cycle is mandatory for all application code:

- **Red**: Write a failing test that captures the desired behavior
  *before* writing any implementation code.
- **Green**: Write the minimum implementation code required to make the
  test pass.
- **Refactor**: Clean up the implementation while keeping all tests
  green.

Every API endpoint MUST have:

- At least one **positive** test case (expected success path).
- At least one **negative** test case (invalid input, unauthorized
  access, missing resource).

Pull requests without corresponding tests MUST be rejected.

### III. Architectural Integrity

All modules MUST adhere to the **Single Responsibility Principle (SRP)**:

- Each module, class, or function MUST have one clearly defined
  responsibility.
- Services MUST be decoupled — no service may directly import or
  instantiate another service's internal models.
- Cross-service communication MUST occur through well-defined
  interfaces (API contracts, dependency injection).
- Circular dependencies are prohibited.

### IV. YAGNI (You Aren't Gonna Need It)

- Code MUST solve the current, specified requirement — nothing more.
- Speculative abstractions, unused configuration options, and
  premature optimizations are prohibited.
- If a capability is not in an approved specification, it MUST NOT be
  implemented.

## Technology Stack

### Backend

| Layer            | Technology                       |
|------------------|----------------------------------|
| **Language**     | Python 3.11+                     |
| **Framework**    | FastAPI                          |
| **Database**     | PostgreSQL                       |
| **ORM**          | SQLAlchemy (async where needed)  |
| **Auth**         | JWT (JSON Web Tokens)            |
| **Testing**      | pytest                           |

### Frontend

| Layer               | Technology                                   |
|---------------------|----------------------------------------------|
| **Framework**       | React.js (initialized via Vite)              |
| **Language**        | TypeScript                                   |
| **Styling**         | Tailwind CSS                                 |
| **API Integration** | `fetch` or `axios` → FastAPI backend         |
| **State Mgmt**      | React Context / standard hooks (YAGNI)       |
| **Testing**         | Vitest + React Testing Library               |

### Architecture

| Concern              | Rule                                            |
|----------------------|-------------------------------------------------|
| **Folder Structure** | Frontend lives in `/frontend` at project root   |
| **Separation**       | `/frontend` and `/app` (backend) are independent |
| **API Base URL**     | `http://localhost:8000/api/v1`                   |
| **CORS**             | Backend MUST allow frontend origin               |

Deviations from this stack MUST be justified in the implementation plan
and approved before work begins.

## Engineering Standards

### Backend Code Style

- Strict adherence to **PEP 8** is required on all Python source files.
- Linting (e.g., `ruff` or `flake8`) MUST pass with zero warnings
  before a pull request is eligible for review.
- All modules, classes, and public functions MUST include **docstrings**
  following Google or NumPy style conventions.
- All function signatures MUST use **type hints** (`typing` module or
  built-in generics).

### Frontend Code Style

- Strict adherence to **ESLint** rules is required on all
  TypeScript/JSX source files.
- All components MUST be **functional components** using hooks.
- Component files MUST use **PascalCase** naming (e.g., `LoginForm.tsx`).
- Utility/service files MUST use **camelCase** naming (e.g., `apiClient.ts`).
- All component props MUST be typed via TypeScript interfaces or types.
- Inline styles are prohibited — use Tailwind CSS utility classes.

### Frontend Testing

- Each page/feature MUST have at least one integration test verifying
  the user flow (render → interact → assert).
- API calls in tests MUST be mocked — tests MUST NOT depend on a
  running backend.
- Test files MUST be co-located with the component or in a `__tests__/`
  directory.

### Error Handling

All API error responses MUST use a standardized JSON structure:

```json
{
  "detail": "<human-readable message>"
}
```

Explicit HTTP status codes MUST be used:

| Code | Usage                                         |
|------|-----------------------------------------------|
| 400  | Malformed request / validation failure        |
| 401  | Missing or invalid authentication credentials |
| 403  | Authenticated but insufficient permissions    |
| 404  | Requested resource not found                  |
| 500  | Unhandled server error (must be logged)       |

The frontend MUST display user-friendly error messages derived from
the `detail` field. Raw status codes MUST NOT be shown to end users.

### Documentation

- Every Python module MUST begin with a module-level docstring
  describing its purpose.
- Public API endpoints MUST include OpenAPI summary and description
  metadata via FastAPI decorators.
- React components MUST include a JSDoc comment describing their
  purpose and props.
- README and quickstart documentation MUST be kept in sync with any
  architectural changes.

## Governance

1. **Supremacy** — This constitution supersedes all ad-hoc practices.
   Conflicts MUST be resolved in favor of the constitution.
2. **Amendment Process** — Amendments require:
   - A written proposal describing the change and rationale.
   - Approval from the project lead or designated reviewers.
   - A migration plan if existing code is affected.
3. **Versioning** — The constitution follows **Semantic Versioning**:
   - MAJOR: Backward-incompatible principle removal or redefinition.
   - MINOR: New principle or materially expanded guidance.
   - PATCH: Clarifications, wording, or non-semantic refinements.
4. **Compliance Review** — Every pull request and code review MUST
   verify compliance with the principles defined above. Non-compliant
   submissions MUST be rejected with a reference to the violated
   principle.

**Version**: 1.1.0 | **Ratified**: 2026-02-25 | **Last Amended**: 2026-02-25
