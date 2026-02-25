# API Contract: Evaluations

**Prefix**: `/api/v1/ideas`

---

## POST `/{idea_id}/evaluate`

**Auth**: Bearer JWT
**Role**: evaluator (admin)
**Description**: Accept or reject a submitted idea with a mandatory comment.

### Request Headers

```
Authorization: Bearer <token>
```

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| idea_id | UUID | Idea to evaluate |

### Request Body

```json
{
  "decision": "accepted",
  "comment": "Great idea, approved for Q3 implementation."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| decision | string | ✅ | Must be `accepted` or `rejected` |
| comment | string | ✅ | Non-empty |

### Response — 201 Created

```json
{
  "id": "d4e5f6g7-...",
  "idea_id": "b2c3d4e5-...",
  "evaluator_id": "c3d4e5f6-...",
  "decision": "accepted",
  "comment": "Great idea, approved for Q3 implementation.",
  "created_at": "2026-02-25T11:00:00Z"
}
```

### Side Effects

- Idea `status` is updated to match `decision` value.
- Idea `updated_at` is set to current timestamp.

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing comment | `{"detail": "Review comment is required"}` |
| 400 | Already evaluated | `{"detail": "Idea has already been evaluated"}` |
| 401 | Missing/invalid token | `{"detail": "Not authenticated"}` |
| 403 | Caller is not evaluator | `{"detail": "Insufficient permissions"}` |
| 404 | Idea not found | `{"detail": "Idea not found"}` |
