# Feature Specification: InnovatEPAM Portal Frontend

**Feature Branch**: `002-portal-frontend`
**Created**: 2026-02-25
**Status**: Draft
**Input**: User description: "Frontend Web Application for InnovatEPAM Portal — React/Vite with Tailwind CSS connecting to existing FastAPI backend"

## User Scenarios & Testing

### User Story 1 — Login & Registration (Priority: P1)

A new user visits the portal and creates an account by providing their email,
username, and password. After registration they are automatically logged in and
redirected to the ideas dashboard. A returning user can log in with their
email and password. After authentication the JWT token is stored and used for
all subsequent API calls. The user can log out, which clears the stored token.

**Why this priority**: Authentication is a prerequisite for every other feature.
No page in the portal is useful without an identity.

**Independent Test**: Register a user, log in, see the dashboard, log out, and
confirm that protected pages redirect back to login.

**Acceptance Scenarios**:

1. **Given** the user is on the login page, **When** they click "Register"
   and submit valid credentials, **Then** an account is created, a token is
   stored, and the user is redirected to the ideas dashboard.
2. **Given** the user has an account, **When** they enter valid credentials on
   the login page, **Then** a JWT token is returned, stored locally, and the
   dashboard loads.
3. **Given** the user is logged in, **When** they click "Logout", **Then**
   the token is cleared and the user is redirected to the login page.
4. **Given** the user provides an already-registered email, **When** they
   submit the registration form, **Then** an inline error message is shown.
5. **Given** an unauthenticated user, **When** they navigate to a protected
   route, **Then** they are redirected to the login page.

---

### User Story 2 — Idea Dashboard & Listing (Priority: P1)

An authenticated user lands on the Ideas Dashboard which shows a paginated
list of all submitted ideas. Each card displays the idea title, category,
status badge, and submission date. The user can filter ideas to see only their
own submissions (`mine=true`) and optionally filter by status. Pagination
controls allow navigating through large datasets.

**Why this priority**: The dashboard is the primary landing page and the core
browsing experience for all users.

**Independent Test**: Log in, view the dashboard, apply filters, navigate
pages.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** the dashboard loads, **Then** ideas
   are listed in reverse-chronological order with title, category, status
   badge, and date.
2. **Given** more than 20 ideas, **When** the dashboard loads, **Then**
   pagination controls appear and the user can page through results.
3. **Given** the user toggles "My Ideas", **When** the filter is applied,
   **Then** only ideas authored by the current user are shown.
4. **Given** the user selects a status filter, **When** applied, **Then** only
   ideas with that status are shown.

---

### User Story 3 — Submit New Idea (Priority: P2)

A submitter clicks "New Idea" from the dashboard. A form appears with fields
for title, description, category, and an optional file attachment. On
successful submission the idea appears in the dashboard with status
"submitted". Validation errors are shown inline.

**Why this priority**: Idea submission is the primary value-generating action,
but reading existing ideas (US2) is needed first.

**Independent Test**: Submit an idea via the form, verify it appears in the
dashboard list.

**Acceptance Scenarios**:

1. **Given** a submitter on the dashboard, **When** they click "New Idea",
   **Then** a creation form is displayed.
2. **Given** a valid form, **When** submitted, **Then** a success notification
   is shown and the new idea appears in the list.
3. **Given** an empty title field, **When** submission is attempted, **Then**
   an inline validation error is shown and the form is not submitted.
4. **Given** a file larger than 5 MB or of disallowed type, **When** attached,
   **Then** a validation error is shown before submission.

---

### User Story 4 — Idea Detail View (Priority: P2)

A user clicks on an idea card to navigate to the idea detail page. The detail
page displays the full title, description, category, status, author, created
date, and attachment download link (if present). If the idea has been
evaluated, the evaluation decision and comment are displayed.

**Why this priority**: Users need full context before evaluating, and submitters
need to see feedback.

**Independent Test**: Click an idea card, verify all fields render, check
evaluation section visibility.

**Acceptance Scenarios**:

1. **Given** a user on the dashboard, **When** they click an idea card,
   **Then** the detail page loads with all idea fields.
2. **Given** an evaluated idea, **When** the detail page loads, **Then** the
   evaluation decision badge and comment are displayed.
3. **Given** an idea with an attachment, **When** the detail page loads,
   **Then** a download link for the attachment is visible.

---

### User Story 5 — Evaluate Idea (Priority: P3)

An evaluator views an idea detail page and sees an evaluation panel. The panel
contains a decision dropdown (accept / reject) and a mandatory comment field.
On submission the idea status updates immediately on the page. If the idea has
already been evaluated, the panel is hidden and the existing evaluation is
shown instead.

**Why this priority**: Evaluation is critical but only relevant after ideas can
be viewed and submitted.

**Independent Test**: Log in as evaluator, open an un-evaluated idea, submit
an evaluation, verify status changes.

**Acceptance Scenarios**:

1. **Given** an evaluator viewing an un-evaluated idea, **When** the page
   loads, **Then** the evaluation panel is visible with decision and comment
   fields.
2. **Given** a valid evaluation form, **When** submitted, **Then** the
   evaluation is saved and the idea status updates on page.
3. **Given** an already-evaluated idea, **When** an evaluator views it,
   **Then** the evaluation panel is hidden and the existing decision is shown.
4. **Given** a submitter (not evaluator) viewing any idea, **When** the page
   loads, **Then** no evaluation panel is shown.

---

### User Story 6 — Role-Based UI (Priority: P3)

The application adapts its UI based on the current user's role. Submitters see
the "New Idea" button but do not see the evaluation panel. Evaluators see the
evaluation panel on un-evaluated ideas but cannot submit new ideas. Navigation
and action buttons reflect the user's capabilities.

**Why this priority**: Role-based UI is a polish/completeness concern that
builds on top of all other stories.

**Independent Test**: Log in as submitter vs. evaluator and compare visible
elements.

**Acceptance Scenarios**:

1. **Given** a logged-in submitter, **When** the dashboard loads, **Then** the
   "New Idea" button is visible.
2. **Given** a logged-in evaluator, **When** the dashboard loads, **Then** the
   "New Idea" button is hidden.
3. **Given** a submitter on the detail page, **When** the idea is evaluated,
   **Then** only the evaluation result is shown (no eval form).

---

### Edge Cases

- What happens when the JWT token expires mid-session? → The user is
  redirected to login with a "Session expired" message.
- What happens when the backend is unreachable? → A connection error banner is
  shown.
- What happens when the user tries to access a non-existent idea ID? →
  A "Not Found" page is displayed.
- What happens with very long idea titles or descriptions? → Text is
  truncated with ellipsis in cards, shown in full on the detail page.

## Requirements

### Functional Requirements

- **FR-001**: System MUST render a login form accepting email and password.
- **FR-002**: System MUST render a registration form accepting email, username,
  and password.
- **FR-003**: System MUST store the JWT token after login/registration and
  include it in all API request headers.
- **FR-004**: System MUST redirect unauthenticated users to the login page.
- **FR-005**: System MUST display a paginated list of ideas on the dashboard.
- **FR-006**: System MUST support filtering ideas by ownership (`mine`) and
  status.
- **FR-007**: System MUST provide a form for submitting new ideas with title,
  description, category, and optional attachment.
- **FR-008**: System MUST validate file size (≤ 5 MB) and allowed types
  (.pdf, .png, .jpg, .jpeg, .docx) before upload.
- **FR-009**: System MUST display full idea details including evaluation
  results on a dedicated detail page.
- **FR-010**: System MUST display an evaluation panel (decision + comment)
  for evaluators viewing un-evaluated ideas.
- **FR-011**: System MUST hide evaluator-only UI elements from submitters and
  vice-versa based on the JWT role claim.
- **FR-012**: System MUST display user-friendly error messages for all API
  errors (derived from the `detail` field).
- **FR-013**: System MUST handle token expiry by redirecting to login with a
  notification.

### Key Entities

- **User**: email, username, role (submitter | evaluator), JWT token (client
  side only).
- **Idea**: id, title, description, category, status
  (submitted | accepted | rejected), author, attachment filename, timestamps.
- **Evaluation**: id, decision, comment, evaluator, idea reference.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can register, log in, and reach the dashboard in under
  30 seconds.
- **SC-002**: The ideas dashboard loads and renders within 2 seconds.
- **SC-003**: Idea submission (form fill → confirmation) completes in under
  1 minute.
- **SC-004**: Evaluators can review and evaluate an idea in under 2 minutes.
- **SC-005**: 100% of backend API endpoints are consumed by the frontend.
- **SC-006**: Role-based UI correctly hides/shows elements for submitters and
  evaluators with zero incorrect visibility.
- **SC-007**: All form validation errors are displayed inline before API
  submission.
