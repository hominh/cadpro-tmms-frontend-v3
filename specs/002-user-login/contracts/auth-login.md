# Authentication Login Contract

The endpoint URL is configured through `NEXT_PUBLIC_LOGIN_API_URL`. JSON field names in
this contract are case-sensitive.

## Request

```http
POST ${NEXT_PUBLIC_LOGIN_API_URL}
Content-Type: application/json
```

```json
{
  "username": "user@example.com",
  "password": "user-password",
  "machineCode": "fingerprint-visitor-id"
}
```

`machineCode` is the FingerprintJS `visitorId`. The password is transmitted only over
the configured secure transport and is never persisted.

## Response envelope

Every backend JSON envelope uses these exact top-level fields:

```ts
interface AuthenticationResponseEnvelope {
  Status: number;
  Message: string | null;
  Data: unknown;
}
```

`Status` is the business status and is independent of the HTTP status. `Message` is the
only backend field eligible for safe error feedback. `Data` is validated according to
the business outcome. Lowercase `status`, `message`, or `data` is invalid.

## Successful response

```json
{
  "Status": 1,
  "Message": "Đăng nhập thành công",
  "Data": {
    "user_id": "user-id",
    "user_name": "demo-user",
    "ToChuc_Id": "organization-id",
    "access_token": "<jwt-access-token>",
    "refresh_token": "<refresh-token>",
    "roles": [],
    "permissions": [],
    "exp_refresh": 1760000000
  }
}
```

For `Status: 1`, `Data` must be a non-array object and contain all eight documented
fields. `user_id` and `ToChuc_Id` accept non-empty string or numeric backend identifiers;
`user_name`, `access_token`, and `refresh_token` are non-empty strings; `roles` and
`permissions` are arrays that may be empty; `exp_refresh` is a string or number.

After validation, the frontend persists only this allowlisted session and redirects to
`/dashboard`:

```json
{
  "Status": 1,
  "Data": {
    "user_id": "user-id",
    "user_name": "demo-user",
    "ToChuc_Id": "organization-id",
    "access_token": "<jwt-access-token>",
    "refresh_token": "<refresh-token>",
    "roles": [],
    "permissions": [],
    "exp_refresh": 1760000000
  }
}
```

No password, `Message`, or unknown response field is persisted.

## Two-factor response

```json
{
  "Status": -131,
  "Message": "Yêu cầu xác thực hai yếu tố",
  "Data": null
}
```

The frontend displays exactly `Tính năng xác thực 2 yếu tố đang phát triển`, creates no
session, and starts no 2FA flow. Missing success fields inside `Data` do not make this
business outcome malformed.

## Other business failure

```json
{
  "Status": 0,
  "Message": "Tên đăng nhập hoặc mật khẩu không đúng",
  "Data": null
}
```

A non-success `Status` is a valid business outcome when the exact envelope is present.
The UI may show a safe non-empty `Message`; it never reads lowercase `message`. No failed
outcome may create or overwrite a session.

## HTTP and transport failures

- Network/invalid HTTP failures produce a recoverable service error.
- For a non-OK HTTP response with a valid JSON envelope, transport classification remains
  non-OK while safe feedback is read only from uppercase `Message`.
- A backend `Status`, including `-131`, must not be silently discarded when transported
  in a parseable response; the outcome layer retains its business status.

## Malformed responses

The following HTTP-success payload is invalid because it uses undocumented lowercase
aliases:

```json
{
  "status": 1,
  "message": "ok",
  "data": {}
}
```

`MALFORMED_RESPONSE` applies when the exact envelope is missing/invalid or when
`Status: 1` lacks a complete valid `Data`. Property order does not matter. A complete
uppercase successful response must never be rejected due to lowercase client reads.
