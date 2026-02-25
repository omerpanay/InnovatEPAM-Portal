<!--
  Sync Impact Report
  ==================
  Version change: 0.0.0 (template) → 1.0.0
  Modified principles: N/A (initial population from template)
  Added sections:
    - Principle I: Spec-Driven Development (SDD)
    - Principle II: Test-Driven Development (TDD)
    - Principle III: Architectural Integrity
    - Principle IV: YAGNI
    - Section: Technology Stack
    - Section: Engineering Standards
    - Section: Governance
  Removed sections: None
  Templates requiring updates:
    - plan-template.md    ✅ Compatible (Constitution Check section aligns)
    - spec-template.md    ✅ Compatible (User Stories & Testing section aligns)
    - tasks-template.md   ✅ Compatible (TDD task ordering aligns)
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

- **Red**: Write a failing `pytest` test that captures the desired
  behavior *before* writing any implementation code.
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

| Layer            | Technology                       |
|------------------|----------------------------------|
| **Language**     | Python 3.11+                     |
| **Framework**    | FastAPI                          |
| **Database**     | PostgreSQL                       |
| **ORM**          | SQLAlchemy (async where needed)  |
| **Auth**         | JWT (JSON Web Tokens)            |
| **Testing**      | pytest                           |

Deviations from this stack MUST be justified in the implementation plan
and approved before work begins.

## Engineering Standards

### Code Style

- Strict adherence to **PEP 8** is required on all Python source files.
- Linting (e.g., `ruff` or `flake8`) MUST pass with zero warnings
  before a pull request is eligible for review.
- All modules, classes, and public functions MUST include **docstrings**
  following Google or NumPy style conventions.
- All function signatures MUST use **type hints** (`typing` module or
  built-in generics).

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

Generic `Exception` catches that silently swallow errors are prohibited.

### Documentation

- Every Python module MUST begin with a module-level docstring
  describing its purpose.
- Public API endpoints MUST include OpenAPI summary and description
  metadata via FastAPI decorators.
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

**Version**: 1.0.0 | **Ratified**: 2026-02-25 | **Last Amended**: 2026-02-25
