# Data Model: InnovatEPAM Portal Frontend

**Feature**: `002-portal-frontend`

> The frontend does not own a database. This document describes the
> **client-side data shapes** consumed from the backend API and stored
> in application state.

## Client-Side Types

### AuthUser (Context state)

| Field          | Type     | Source              |
|----------------|----------|---------------------|
| `id`           | string   | JWT `sub` claim     |
| `email`        | string   | register response   |
| `username`     | string   | register response   |
| `role`         | string   | JWT `role` claim    |
| `accessToken`  | string   | login/register      |

Stored in `AuthContext` and `localStorage`.

### IdeaListItem (Dashboard card)

| Field        | Type     | API Field     |
|--------------|----------|---------------|
| `id`         | string   | `id`          |
| `title`      | string   | `title`       |
| `category`   | string   | `category`    |
| `status`     | string   | `status`      |
| `authorId`   | string   | `author_id`   |
| `createdAt`  | string   | `created_at`  |

### IdeaDetail (Detail page)

| Field                | Type            | API Field              |
|----------------------|-----------------|------------------------|
| `id`                 | string          | `id`                   |
| `title`              | string          | `title`                |
| `description`        | string          | `description`          |
| `category`           | string          | `category`             |
| `status`             | string          | `status`               |
| `authorId`           | string          | `author_id`            |
| `attachmentFilename` | string \| null  | `attachment_filename`  |
| `createdAt`          | string          | `created_at`           |
| `updatedAt`          | string          | `updated_at`           |
| `evaluation`         | Evaluation \| null | nested (detail only) |

### Evaluation

| Field         | Type   | API Field      |
|---------------|--------|----------------|
| `id`          | string | `id`           |
| `ideaId`      | string | `idea_id`      |
| `evaluatorId` | string | `evaluator_id` |
| `decision`    | string | `decision`     |
| `comment`     | string | `comment`      |
| `createdAt`   | string | `created_at`   |

### PaginatedResponse\<T\>

| Field   | Type   |
|---------|--------|
| `items` | T[]    |
| `total` | number |
| `skip`  | number |
| `limit` | number |

## State Transitions

### Idea Status

```text
submitted ──► accepted
          └─► rejected
```

Transition is triggered server-side by evaluation. Frontend reflects the
updated status after evaluation API call.

### Auth State

```text
unauthenticated ──► authenticated (login/register)
authenticated   ──► unauthenticated (logout / token expiry / 401)
```
