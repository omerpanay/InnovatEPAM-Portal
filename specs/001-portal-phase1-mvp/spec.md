# Feature Specification: InnovatEPAM Portal — Phase 1 MVP

**Feature Branch**: `001-portal-phase1-mvp`
**Created**: 2026-02-25
**Status**: Draft
**Input**: User description: "Create the PRD and User Stories for the InnovatEPAM Portal Phase 1 MVP covering User Management, Idea Submission, and Evaluation Workflow."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — User Registration & Login (Priority: P1)

As a new user, I want to register an account and log in so that I can
access the portal and submit or evaluate ideas.

**Why this priority**: Authentication is the foundational gate — no
other feature can function without identity management.

**Independent Test**: A user can register, receive a JWT, log in with
valid credentials, and be rejected with invalid credentials.

**Acceptance Scenarios**:

1. **Given** the registration page, **When** a user submits a valid
   email, username, and password, **Then** the system creates an
   account and returns a success response with a JWT.
2. **Given** the registration page, **When** a user submits an email
   that is already registered, **Then** the system returns a 400 error
   with message "Email already registered".
3. **Given** a registered user, **When** they submit correct
   credentials to the login endpoint, **Then** the system returns a
   valid JWT containing the user's role.
4. **Given** a registered user, **When** they submit an incorrect
   password, **Then** the system returns a 401 error with message
   "Invalid credentials".
5. **Given** an authenticated user, **When** they call the logout
   endpoint, **Then** their session/token is invalidated.
6. **Given** an expired or invalid JWT, **When** any protected
   endpoint is called, **Then** the system returns a 401 error.

---

### User Story 2 — Role-Based Access (Priority: P1)

As a portal administrator, I want users to have distinct roles
(submitter vs. evaluator/admin) so that only authorized users can
evaluate and manage ideas.

**Why this priority**: Role distinction is required before any
feature-gated workflow can be implemented.

**Independent Test**: A submitter can submit ideas but cannot access
evaluation endpoints; an evaluator/admin can access evaluation
endpoints.

**Acceptance Scenarios**:

1. **Given** a newly registered user, **When** the registration
   completes, **Then** the user is assigned the "submitter" role by
   default.
2. **Given** a user with the "submitter" role, **When** they attempt
   to access an evaluation-only endpoint, **Then** the system returns
   a 403 error with message "Insufficient permissions".
3. **Given** an admin user, **When** they promote a user to
   "evaluator" role, **Then** the target user's role is updated and
   subsequent requests reflect the new permissions.

---

### User Story 3 — Idea Submission (Priority: P1)

As a submitter, I want to submit an idea with a title, description,
category, and optional file attachment so that my idea is recorded for
evaluation.

**Why this priority**: Idea submission is the core value proposition
of the portal — the primary reason users visit.

**Independent Test**: A submitter can create an idea, see it in the
idea listing, and the idea persists in the database.

**Acceptance Scenarios**:

1. **Given** an authenticated submitter, **When** they submit a valid
   idea (title, description, category), **Then** the system creates
   the idea with status "submitted" and returns it with an ID.
2. **Given** an authenticated submitter, **When** they submit an idea
   with a file attachment (≤ 5 MB, allowed types: PDF, PNG, JPG,
   DOCX), **Then** the file is stored and linked to the idea.
3. **Given** an authenticated submitter, **When** they submit an idea
   with a file exceeding 5 MB, **Then** the system returns a 400 error
   with message "File size exceeds maximum limit".
4. **Given** an authenticated submitter, **When** they submit an idea
   with an unsupported file type, **Then** the system returns a 400
   error with message "File type not allowed".
5. **Given** an authenticated submitter, **When** they submit an idea
   without a title, **Then** the system returns a 400 error with
   specific validation details.
6. **Given** a non-authenticated user, **When** they attempt to submit
   an idea, **Then** the system returns a 401 error.

---

### User Story 4 — Idea Listing & Viewing (Priority: P2)

As any authenticated user, I want to view a list of submitted ideas
and see the details of a single idea so that I can browse innovation
proposals.

**Why this priority**: Listing enables discoverability but depends on
ideas existing first (US3).

**Independent Test**: An authenticated user can retrieve a paginated
list of ideas and view any single idea's full details.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they request the idea
   list endpoint, **Then** the system returns a paginated list of
   ideas with title, category, status, and creation date.
2. **Given** an authenticated user, **When** they request a specific
   idea by ID, **Then** the system returns the full idea details
   including any attachment metadata.
3. **Given** an authenticated user, **When** they request an idea that
   does not exist, **Then** the system returns a 404 error.
4. **Given** a non-authenticated user, **When** they request the idea
   list, **Then** the system returns a 401 error.

---

### User Story 5 — Idea Evaluation by Admin (Priority: P2)

As an evaluator/admin, I want to review submitted ideas and accept or
reject them with comments so that worthy ideas can progress.

**Why this priority**: The evaluation workflow completes the idea
lifecycle and delivers feedback to submitters.

**Independent Test**: An admin can change an idea's status to
"accepted" or "rejected" and attach a review comment.

**Acceptance Scenarios**:

1. **Given** an evaluator/admin viewing a "submitted" idea, **When**
   they accept the idea with a comment, **Then** the idea status
   changes to "accepted" and the comment is stored.
2. **Given** an evaluator/admin viewing a "submitted" idea, **When**
   they reject the idea with a comment, **Then** the idea status
   changes to "rejected" and the comment is stored.
3. **Given** an evaluator/admin, **When** they attempt to evaluate an
   idea without providing a comment, **Then** the system returns a 400
   error with message "Review comment is required".
4. **Given** a submitter, **When** they attempt to evaluate an idea,
   **Then** the system returns a 403 error.
5. **Given** an evaluator/admin, **When** they attempt to evaluate an
   idea that is already "accepted" or "rejected", **Then** the system
   returns a 400 error with message "Idea has already been evaluated".

---

### User Story 6 — Idea Status Tracking (Priority: P3)

As a submitter, I want to see the current status of my submitted ideas
so that I know whether they are under review, accepted, or rejected.

**Why this priority**: Status visibility is valuable but secondary to
the core submit-and-evaluate loop.

**Independent Test**: A submitter can filter their own ideas by status
and see the latest evaluation comment.

**Acceptance Scenarios**:

1. **Given** a submitter, **When** they request their own ideas,
   **Then** the system returns only ideas authored by that submitter.
2. **Given** an idea that has been evaluated, **When** the submitter
   views the idea detail, **Then** the response includes the current
   status and the evaluator's comment.

---

### Edge Cases

- What happens when a user tries to register with a malformed email?
  → 400 error with validation details.
- What happens when an attachment upload is interrupted midway?
  → The idea is not created; the system returns a 500 error and
  cleans up partial uploads.
- What happens when two admins try to evaluate the same idea
  simultaneously? → The first evaluation wins; the second receives
  a 400 "Idea has already been evaluated" error.
- What happens when a user's JWT expires mid-session?
  → 401 error on the next request.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with email,
  username, and password.
- **FR-002**: System MUST validate email format and enforce unique
  email constraint.
- **FR-003**: System MUST hash passwords before storage (never store
  plaintext).
- **FR-004**: System MUST issue JWTs upon successful login containing
  user ID and role.
- **FR-005**: System MUST support token-based logout (token
  blocklisting or short-lived tokens).
- **FR-006**: System MUST assign the "submitter" role to new users by
  default.
- **FR-007**: System MUST support two roles: "submitter" and
  "evaluator" (admin).
- **FR-008**: System MUST allow role promotion by admins only.
- **FR-009**: System MUST allow authenticated submitters to create
  ideas with title (required), description (required), and
  category (required).
- **FR-010**: System MUST support a single file attachment per idea
  (max 5 MB; allowed formats: PDF, PNG, JPG, DOCX).
- **FR-011**: System MUST set new ideas to "submitted" status upon
  creation.
- **FR-012**: System MUST provide a paginated list endpoint for ideas.
- **FR-013**: System MUST provide a detail endpoint for a single idea.
- **FR-014**: System MUST allow evaluators to accept or reject
  "submitted" ideas with a mandatory comment.
- **FR-015**: System MUST prevent re-evaluation of already-evaluated
  ideas.
- **FR-016**: System MUST allow submitters to filter ideas by their
  own authorship.
- **FR-017**: System MUST return standardized JSON error responses
  with appropriate HTTP status codes (400, 401, 403, 404, 500).

### Key Entities

- **User**: Represents a portal member. Key attributes: id, email,
  username, hashed_password, role (submitter | evaluator),
  created_at.
- **Idea**: Represents a submitted innovation proposal. Key
  attributes: id, title, description, category, status (submitted |
  under_review | accepted | rejected), author_id (FK → User),
  attachment_path, created_at, updated_at.
- **Evaluation**: Represents an admin's review decision. Key
  attributes: id, idea_id (FK → Idea), evaluator_id (FK → User),
  decision (accepted | rejected), comment, created_at.

### Assumptions

- Pagination defaults to 20 items per page unless specified by the
  client.
- File attachments are stored on the local filesystem in Phase 1;
  cloud storage is deferred to a future phase.
- "under_review" is an intermediate status set when an evaluator opens
  an idea for review (optional UX enhancement, not blocking).
- Category values are a predefined list managed via configuration
  (not a dynamic CRUD resource in Phase 1).
- Session/token invalidation on logout uses a token blocklist
  approach.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete registration and first login in
  under 30 seconds.
- **SC-002**: A submitter can submit an idea (including attachment
  upload) in under 60 seconds.
- **SC-003**: An evaluator can review and render a decision on an idea
  in under 2 minutes.
- **SC-004**: The system supports at least 100 concurrent
  authenticated users without degradation.
- **SC-005**: 100% of API endpoints return correct HTTP status codes
  for both valid and invalid requests (verified by automated tests).
- **SC-006**: Every user story has at least one positive and one
  negative automated test (TDD compliance per Constitution
  Principle II).
- **SC-007**: No endpoint is accessible without valid authentication
  (except registration and login).
