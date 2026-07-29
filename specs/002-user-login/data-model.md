# Data Model: User Login

## LoginRequest

- **Fields**: Backend-defined identifier and password fields.
- **Validation**: The identifier and password are required by the login form. The
  password is never transformed or persisted.
- **Contract status**: Field names are TBD until the backend contract is supplied.

## LoginResponse

- **Fields**: The complete backend-approved successful response.
- **Expected categories**: Authentication/session data, user information, and any
  non-sensitive metadata explicitly approved for client persistence.
- **Validation**: The response mapper must validate the agreed required fields before
  creating a session or redirecting.
- **Contract status**: Exact shape and token field names are TBD.

## StoredAuthSession

- **Fields**: The safe-to-store mapped login response.
- **Storage**: One namespaced localStorage record.
- **Forbidden data**: Passwords, raw credentials, and backend-declared secret fields.
- **Lifecycle**: Write only after a validated success; preserve existing data on failure;
  replace or clear stale data according to the agreed authentication policy.

## LoginState

- **States**: idle, pending, success, invalid-credentials, service-error, validation-error.
- **Transitions**:

```text
idle → pending → success → redirect
idle → pending → invalid-credentials → idle
idle → pending → service-error → idle
idle → validation-error → idle
```

## RouteAccessPolicy

- **Public routes**: `/login`.
- **Entry route**: `/`; redirects to `/dashboard` when authenticated and `/login` when
  anonymous.
- **Protected routes**: Every route not explicitly public, including `/dashboard`.
- **Decision states**: checking, anonymous, authenticated.
- **Invalid session**: Missing, malformed, or incomplete localStorage data is anonymous.

```text
checking → anonymous → redirect /login
checking → authenticated → render protected route
authenticated + route / or /login → redirect /dashboard
```
