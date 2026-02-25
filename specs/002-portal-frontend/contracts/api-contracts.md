# API Contracts: Frontend → Backend

**Feature**: `002-portal-frontend`
**Base URL**: `http://localhost:8000/api/v1`

All requests except login and register MUST include:

```
Authorization: Bearer <access_token>
```

---

## Authentication

### POST /auth/register

**Request** (`application/json`):

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepass123"
}
```

**Response 201**:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "role": "submitter",
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

**Errors**: 400 (duplicate email), 422 (validation)

---

### POST /auth/login

**Request** (`application/json`):

```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response 200**:

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

**Errors**: 401 (invalid credentials)

---

### POST /auth/logout

**Request**: empty body, `Authorization` header required.

**Response 200**:

```json
{ "detail": "Successfully logged out" }
```

---

## Ideas

### GET /ideas?skip=0&limit=20&mine=false&status=submitted

**Response 200**:

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "string",
      "category": "process_improvement",
      "status": "submitted",
      "author_id": "uuid",
      "created_at": "2026-02-25T12:00:00Z"
    }
  ],
  "total": 42,
  "skip": 0,
  "limit": 20
}
```

**Query params**:

| Param    | Type    | Default | Description                     |
|----------|---------|---------|---------------------------------|
| `skip`   | int     | 0       | Offset for pagination           |
| `limit`  | int     | 20      | Items per page (max 100)        |
| `mine`   | bool    | false   | Only show current user's ideas  |
| `status` | string  | —       | Filter by status                |

---

### POST /ideas

**Request** (`multipart/form-data`):

| Field        | Type     | Required |
|--------------|----------|----------|
| `title`      | string   | Yes      |
| `description`| string   | Yes      |
| `category`   | string   | Yes (enum) |
| `attachment` | file     | No       |

**Category enum**: `process_improvement`, `product_innovation`,
`tech_enhancement`, `culture_initiative`, `cost_optimization`, `other`

**Response 201**: Full `IdeaResponse` object.

**Errors**: 401, 422 (validation)

---

### GET /ideas/{idea_id}

**Response 200**: Full `IdeaResponse` object.

**Errors**: 401, 404

---

## Evaluations

### POST /ideas/{idea_id}/evaluate

**Request** (`application/json`):

```json
{
  "decision": "accepted",
  "comment": "Great innovation, approved for prototype."
}
```

`decision` MUST be `"accepted"` or `"rejected"`.

**Response 200**: `EvaluationResponse` object.

**Errors**: 400 (already evaluated), 403 (not evaluator), 404 (idea not found)

---

## Users

### PUT /users/{user_id}/role

**Request** (`application/json`):

```json
{ "role": "evaluator" }
```

**Response 200**: Updated `UserResponse`.

**Errors**: 403 (not evaluator), 404

---

## Error Format (all endpoints)

```json
{ "detail": "Human-readable error message" }
```
