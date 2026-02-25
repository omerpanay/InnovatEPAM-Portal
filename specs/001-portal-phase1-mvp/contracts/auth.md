# API Contract: Authentication

**Prefix**: `/api/v1/auth`

---

## POST `/register`

**Auth**: None
**Description**: Create a new user account.

### Request Body

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepass123"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string (EmailStr) | ✅ | RFC 5322 format, unique |
| username | string | ✅ | 3–100 characters |
| password | string | ✅ | ≥ 8 characters |

### Response — 201 Created

```json
{
  "id": "a1b2c3d4-...",
  "email": "user@example.com",
  "username": "johndoe",
  "role": "submitter",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Email already registered | `{"detail": "Email already registered"}` |
| 400 | Validation failure | Pydantic 422 detail array |

---

## POST `/login`

**Auth**: None
**Description**: Authenticate and receive a JWT.

### Request Body

```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

### Response — 200 OK

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Invalid credentials | `{"detail": "Invalid credentials"}` |

---

## POST `/logout`

**Auth**: Bearer JWT
**Description**: Invalidate the current token.

### Request Headers

```
Authorization: Bearer <token>
```

### Response — 200 OK

```json
{
  "detail": "Successfully logged out"
}
```

### Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Missing/invalid token | `{"detail": "Not authenticated"}` |
