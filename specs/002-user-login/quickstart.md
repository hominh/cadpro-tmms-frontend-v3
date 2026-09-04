# Quickstart: Validate User Login Contract Alignment

## Prerequisites

- `NEXT_PUBLIC_LOGIN_API_URL` points to the login endpoint.
- The Next.js dependencies and browser dependencies are installed.
- A backend test account or HTTP mock is available.

## Scenario 1: Exact-case successful login

1. Open `/login`, enter valid credentials, and submit once.
2. Confirm the request body is `{ username, password, machineCode }` and `machineCode`
   is the FingerprintJS `visitorId`.
3. Return the complete `Status: 1` example from
   [auth-login.md](contracts/auth-login.md), optionally in a different property order.
4. Confirm no `MALFORMED_RESPONSE` is produced.
5. Confirm one namespaced localStorage record contains `Status: 1` and the allowlisted
   nested `Data` fields using their exact backend names.
6. Confirm no password, `Message`, or unknown response field is stored.
7. Confirm redirect to `/dashboard` and authenticated UI reads `Data.user_name`.

Expected: all eight success fields survive validation and session creation.

## Scenario 2: Lowercase-only regression

Return HTTP 200 with `{ "status": 1, "message": "ok", "data": {} }`.

Expected: the response is `MALFORMED_RESPONSE`, no session is written, the user remains
on `/login`, and recoverable invalid-response feedback is visible.

## Scenario 3: Incomplete successful Data

Repeat a `Status: 1` response with `Data` null, non-object, and with each required field
missing or invalid. Also test empty `roles` and `permissions` arrays.

Expected: null/non-object/partial data is malformed; empty role/permission arrays remain
valid when all other required fields are valid. No partial session is persisted.

## Scenario 4: Two-factor business outcome

Return `{ "Status": -131, "Message": "Yêu cầu xác thực hai yếu tố", "Data": null }`.

Expected: the UI shows `Tính năng xác thực 2 yếu tố đang phát triển`, does not report
malformed data, does not persist a session, and does not redirect or start a 2FA flow.

## Scenario 5: Generic business and transport failures

1. Return a parseable non-success `Status` with uppercase `Message`.
2. Return a non-OK HTTP response with uppercase `Message`.
3. Repeat using only lowercase `message`, then simulate network failure and invalid JSON.

Expected: uppercase `Message` is the only backend feedback source; lowercase `message`
is ignored. Business and transport errors remain distinct, loading ends, and an existing
valid session is not overwritten.

## Scenario 6: Form behavior and accessibility

1. Submit with username empty, then password empty.
2. Submit a valid form against a delayed response and press Enter repeatedly.
3. Navigate and correct the form using only the keyboard.

Expected: no invalid form calls the API; only one pending request is active; accessible
field/status feedback remains unchanged.

## Scenario 7: Route and stored-session validation

1. Seed the exact stored session from the contract and open `/`, `/login`, and a
   protected route.
2. Repeat with invalid JSON, a primitive value, a lowercase legacy session, null/partial
   `Data`, and empty token/user/organization fields.

Expected: the valid session redirects entry/login to `/dashboard` and permits protected
routes. Every malformed or incomplete record is anonymous and redirects protected routes
to `/login` without rendering protected content or looping.

## Automated regression matrix

| Boundary | Required coverage |
|----------|-------------------|
| API decoder | uppercase success, lowercase rejection, missing `Status`, invalid JSON, HTTP failure using uppercase `Message` |
| Response mapper | preserve every required `Data` field; reject null/partial success; accept empty arrays and reordered properties |
| Mutation hook | success persists then redirects; `-131` and generic failure do neither |
| Storage | nested allowlist only, password excluded, failed login does not overwrite |
| Route access | exact session authenticated; stale lowercase/partial/malformed records anonymous |
| E2E | real-case login success and lowercase regression; route protection with exact stored session |

## Validation commands

```powershell
npm run lint
npm run type-check
npm test -- tests/features/auth tests/components
npm run test:e2e -- tests/e2e/login.spec.ts tests/e2e/route-protection.spec.ts
npm run build
```
