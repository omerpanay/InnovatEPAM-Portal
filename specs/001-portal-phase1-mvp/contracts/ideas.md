# API Contract: Ideas

**Prefix**: `/api/v1/ideas`

---

## POST `/`

**Auth**: Bearer JWT
**Role**: submitter
**Description**: Submit a new idea with optional file attachment.

### Request

**Content-Type**: `multipart/form-data`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | ✅ | 1–255 characters |
| description | string | ✅ | Non-empty |
| category | string | ✅ | One of predefined values |
| attachment | file | ❌ | ≤ 5 MB; PDF, PNG, JPG, DOCX |

### Response — 201 Created

```json
{
  "id": "b2c3d4e5-...",
  "title": "Automate onboarding",
  "description": "Use AI to streamline new hire onboarding...",
  "category": "process_improvement",
  "status": "submitted",
  "author_id": "a1b2c3d4-...",
  "attachment_filename": "proposal.pdf",
  "created_at": "2026-02-25T10:30:00Z",
  "updated_at": "2026-02-25T10:30:00Z"
}
```

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing required field | Pydantic validation detail |
| 400 | File too large | `{"detail": "File size exceeds maximum limit"}` |
| 400 | Unsupported file type | `{"detail": "File type not allowed"}` |
| 401 | Missing/invalid token | `{"detail": "Not authenticated"}` |

---

## GET `/`

**Auth**: Bearer JWT
**Role**: any authenticated
**Description**: List ideas with pagination and optional filters.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| skip | int | 0 | Offset for pagination |
| limit | int | 20 | Max items per page (1–100) |
| mine | bool | false | If true, return only caller's ideas |
| status | string | — | Filter by status |

### Response — 200 OK

```json
{
  "items": [
    {
      "id": "b2c3d4e5-...",
      "title": "Automate onboarding",
      "category": "process_improvement",
      "status": "submitted",
      "author_id": "a1b2c3d4-...",
      "created_at": "2026-02-25T10:30:00Z"
    }
  ],
  "total": 42,
  "skip": 0,
  "limit": 20
}
```

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Missing/invalid token | `{"detail": "Not authenticated"}` |

---

## GET `/{idea_id}`

**Auth**: Bearer JWT
**Role**: any authenticated
**Description**: Get full details of a single idea.

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| idea_id | UUID | Idea to retrieve |

### Response — 200 OK

```json
{
  "id": "b2c3d4e5-...",
  "title": "Automate onboarding",
  "description": "Use AI to streamline new hire onboarding...",
  "category": "process_improvement",
  "status": "accepted",
  "author_id": "a1b2c3d4-...",
  "attachment_filename": "proposal.pdf",
  "created_at": "2026-02-25T10:30:00Z",
  "updated_at": "2026-02-25T11:00:00Z",
  "evaluation": {
    "evaluator_id": "c3d4e5f6-...",
    "decision": "accepted",
    "comment": "Great idea, approved for Q3.",
    "created_at": "2026-02-25T11:00:00Z"
  }
}
```

> `evaluation` is `null` if the idea has not been evaluated yet.

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Missing/invalid token | `{"detail": "Not authenticated"}` |
| 404 | Idea not found | `{"detail": "Idea not found"}` |
