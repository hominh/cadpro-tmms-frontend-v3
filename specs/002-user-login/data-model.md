# Data Model: User Login Contract Alignment

## LoginRequest

| Field | Type | Validation |
|-------|------|------------|
| `username` | string | Required; preserve the submitted identifier according to current form behavior |
| `password` | string | Required; never transform, log, or persist |
| `machineCode` | string | Required; generated from FingerprintJS `visitorId` before submission |

## AuthenticationResponseEnvelope

The raw JSON response is decoded from `unknown`; field names are case-sensitive.

| Field | Type | Validation |
|-------|------|------------|
| `Status` | number | Required for every valid backend envelope; determines business outcome |
| `Message` | string \| null | Required as a contract field; only a safe string may be shown to the user |
| `Data` | unknown | Required as an envelope field; validated according to `Status` |

Lowercase `status`, `message`, and `data` are not aliases. Property order is irrelevant.

## LoginSuccessData

Required when `Status === 1`.

| Field | Type | Validation |
|-------|------|------------|
| `user_id` | string \| number | Required, non-empty identity scalar |
| `user_name` | string | Required, non-empty |
| `ToChuc_Id` | string \| number | Required, non-empty organization scalar |
| `access_token` | string | Required, non-empty |
| `refresh_token` | string | Required, non-empty |
| `roles` | unknown[] | Required array; may be empty |
| `permissions` | unknown[] | Required array; may be empty |
| `exp_refresh` | string \| number | Required scalar; exact expiry format is backend-owned |

Role and permission element schemas are intentionally opaque at the login boundary. A
consumer that depends on an element's internal fields must refine it at that use site.

## LoginSuccessResponse

```text
AuthenticationResponseEnvelope
├── Status: 1
├── Message: string | null
└── Data: LoginSuccessData
```

Only this validated outcome may be mapped to a stored session.

## StoredAuthSession

One allowlisted namespaced localStorage record:

```text
StoredAuthSession
├── Status: 1
└── Data
    ├── user_id
    ├── user_name
    ├── ToChuc_Id
    ├── access_token
    ├── refresh_token
    ├── roles
    ├── permissions
    └── exp_refresh
```

- Preserves the successful backend field names and `Data` nesting.
- Omits `Message`, credentials, and unknown/unapproved backend fields.
- Is written atomically only after successful validation.
- Is not overwritten by a failed login.
- Is treated as anonymous when JSON parsing or runtime validation fails.
- Automatic refresh-token renewal is outside this feature.

## LoginOutcome

| Outcome | Condition | Effect |
|---------|-----------|--------|
| success | HTTP processing succeeds, `Status === 1`, complete `Data` | Persist allowlisted session, redirect `/dashboard` |
| two-factor-unavailable | `Status === -131` | Show `Tính năng xác thực 2 yếu tố đang phát triển`; no session write or redirect |
| business-error | Other non-success `Status` | Show safe uppercase `Message` or fallback; no session write |
| transport-error | Network failure or non-OK HTTP response | Show recoverable service error; preserve existing session |
| malformed-response | Exact envelope invalid, or success `Data` incomplete | Report `MALFORMED_RESPONSE`; no partial session |
| validation-error | Request fields invalid | Show field feedback; do not call API |

HTTP status and `Status` are separate inputs: HTTP status classifies transport while
`Status` classifies the backend business outcome.

## LoginState transitions

```text
idle → validation-error → idle
idle → pending → success → persist → redirect
idle → pending → two-factor-unavailable → idle
idle → pending → business-error → idle
idle → pending → transport-error → idle
idle → pending → malformed-response → idle
```

Every terminal response ends the pending state.

## RouteAccessPolicy

- **Public route**: `/login`.
- **Entry route**: `/`; redirects to `/dashboard` for a valid session and `/login`
  otherwise.
- **Protected routes**: All routes not explicitly public, including `/dashboard`.
- **Valid session**: Exact stored shape, `Status === 1`, complete nested `Data`, non-empty
  tokens and identity/organization context, array roles/permissions, valid expiry scalar.
- **Anonymous session cases**: Missing record, invalid JSON, primitive/array value,
  lowercase legacy shape, null/partial `Data`, or missing/empty required values.

```text
checking → anonymous → redirect /login
checking → authenticated → render protected route
authenticated + route / or /login → redirect /dashboard
```
