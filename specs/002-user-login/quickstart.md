# Quickstart: Validate User Login

## Prerequisites

- The Next.js application and package lockfile are available.
- TanStack Query is configured for the application.
- shadcn UI primitives used by the form are installed.
- The backend endpoint and response shape have been filled into
  [auth-login.md](contracts/auth-login.md).
- `NEXT_PUBLIC_LOGIN_API_URL` points to the backend login endpoint.
- A test account with valid credentials is available.

## Scenario 1: Successful login

1. Open the login route.
2. Enter a valid `username` and password.
3. Submit the form once.
4. Confirm the submit control enters a pending state and prevents another submission.
5. Confirm the browser generates a FingerprintJS `visitorId` and sends it as
   `machineCode` in the request body.
6. Return a backend response with `status: 1` and the agreed session/user fields.
7. Confirm the response mapper produces only safe-to-store data.
8. Confirm one namespaced localStorage record contains the mapped backend response.
9. Confirm the browser redirects to `/dashboard`.

Expected result: the authenticated context is available after redirect.

## Scenario 2: Invalid credentials

1. Enter invalid credentials.
2. Submit the form.
3. Return the backend's finalized invalid-credentials response.

Expected result: a clear safe error is displayed, loading ends, the user remains on the
login page, and no new session is persisted.

## Scenario 3: Two-factor response

1. Submit valid credentials.
2. Return a response with `status: -131`.

Expected result: the UI displays `Tính năng xác thực 2 yếu tố đang phát triển`, does not
persist a session, and does not start a 2FA flow.

## Scenario 4: Service failure and malformed success

1. Submit valid-looking credentials.
2. Simulate a network failure, server failure, or response missing a required agreed
   field.

Expected result: a recoverable service error is displayed, loading ends, no partial
session is stored, and the user remains on the login page.

## Scenario 5: Form validation and accessibility

1. Submit with the identifier empty, then with the password empty.
2. Navigate the form using only the keyboard.
3. Inspect the error and pending status feedback.

Expected result: field-level feedback appears without an API call; all controls have
accessible names and the flow is completable without a pointer.

## Scenario 6: Anonymous route protection

1. Clear the namespaced authentication record from localStorage.
2. Open `/dashboard` and any other protected route directly.
3. Confirm the route guard remains in a checking state until the session decision is made.

Expected result: protected content is not rendered and the browser redirects to `/login`.

## Scenario 7: Authenticated entry redirects

1. Store a valid successful authentication response in the namespaced localStorage record.
2. Open `/` and then `/login` directly.

Expected result: both routes redirect to `/dashboard` without a redirect loop.

## Validation commands

Use the repository's configured package manager after the app is initialized:

```text
lint
type-check
unit/component tests
login end-to-end smoke test
build
```

Exact commands are finalized from `package.json` during implementation.
