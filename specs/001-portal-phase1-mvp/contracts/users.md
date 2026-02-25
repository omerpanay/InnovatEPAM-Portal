# API Contract: Users

**Prefix**: `/api/v1/users`

---

## PATCH `/{user_id}/role`

**Auth**: Bearer JWT
**Role**: evaluator (admin)
**Description**: Promote a user's role.

### Request Headers

```
Authorization: Bearer <token>
```

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| user_id | UUID | Target user ID |

### Request Body

```json
{
  "role": "evaluator"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| role | string | ✅ | Must be one of: `submitter`, `evaluator` |

### Response — 200 OK

```json
{
  "id": "a1b2c3d4-...",
  "email": "user@example.com",
  "username": "johndoe",
  "role": "evaluator",
  "created_at": "2026-02-25T10:00:00Z"
}
```

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Missing/invalid token | `{"detail": "Not authenticated"}` |
| 403 | Caller is not evaluator | `{"detail": "Insufficient permissions"}` |
| 404 | User not found | `{"detail": "User not found"}` |
