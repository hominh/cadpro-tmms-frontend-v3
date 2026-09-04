# Research: User Login Contract Alignment

## Decision: Treat the backend envelope as exact and case-sensitive

**Rationale**: JSON property access is case-sensitive, and the backend/legacy integration
uses `Status`, `Message`, and `Data`. Parsing JSON as `unknown` and checking exact own
properties prevents a TypeScript assertion from hiding runtime drift. A lowercase-only
envelope is malformed by contract.

**Alternatives considered**: Supporting uppercase and lowercase aliases was rejected
because it violates FR-027 and masks future contract drift. Casting JSON directly to an
interface was rejected because interfaces do not validate runtime values.

## Decision: Validate according to the business outcome

**Rationale**: `Status` determines the business outcome independently of the HTTP status.
Every decoded envelope requires a numeric `Status`; a complete `Data` object is required
only for `Status: 1`. `Status: -131` and other business failures remain valid envelopes
without success-session data, and safe feedback comes only from uppercase `Message`.

**Alternatives considered**: Requiring successful `Data` fields on every outcome was
rejected because it incorrectly converts valid failures into `MALFORMED_RESPONSE`. Using
HTTP status alone was rejected because it loses backend business semantics.

## Decision: Separate raw envelope, validated success, and stored-session types

**Rationale**: A raw envelope may represent success or failure, while only validated
success data may create a session. Distinct types make partial persistence impossible and
keep the success invariant explicit. `roles` and `permissions` must be arrays but may be
empty; token and identity values must be non-empty; `exp_refresh` accepts the documented
string-or-number scalar until the backend publishes a narrower schema.

**Alternatives considered**: One permissive interface with optional success properties
was rejected because it recreates ambiguous partial sessions. Inventing role, permission,
or expiry subfields without an authoritative schema was rejected.

## Decision: Persist an allowlisted nested success session

**Rationale**: The application persists one namespaced record shaped as `{ Status: 1,
Data: { ...approvedFields } }`. This preserves the documented names and nesting across
the API, mapper, storage, route guard, and UI while excluding password, `Message`, and
unknown backend fields. Writes occur atomically only after validation; failed logins do
not overwrite an existing valid session.

**Alternatives considered**: Persisting the raw response was rejected because it can
retain unapproved data. Flattening or camelCasing the session was rejected because it
creates a second schema and invites consumer drift. Separate localStorage keys were
rejected because partial writes can create inconsistent state.

## Decision: Runtime-validate stored authentication data

**Rationale**: localStorage is untrusted browser input. Route access must parse and
validate `Status === 1`, nested `Data`, non-empty tokens and user/organization context,
array roles/permissions, and `exp_refresh`. Invalid JSON, stale lowercase records, and
partial sessions are anonymous and may be cleared.

**Alternatives considered**: `JSON.parse(...) as StoredAuthSession` was rejected because
it provides no runtime guarantee. Treating legacy lowercase sessions as valid was
rejected because it violates the authoritative contract.

## Decision: Keep TanStack Query and the existing UI lifecycle

**Rationale**: Login remains a server-side mutation. The existing `useMutation` owns
pending, error, success, persistence, and navigation side effects. The contract correction
does not change the shadcn/Tailwind form or its legacy-derived visual layout.

**Alternatives considered**: Fetching directly in the form was rejected because it
duplicates lifecycle logic and violates the project constitution. Redesigning the form
was rejected because no visual change is requested.

## Decision: Test each authentication boundary

**Rationale**: Existing lowercase fixtures can make all tests pass while the real backend
fails. Canonical uppercase fixtures and focused API, mapper, hook, storage, route, and E2E
tests identify which boundary regresses. Required cases include full uppercase success,
`-131`, generic business failure, HTTP failure with uppercase `Message`, lowercase-only
envelope, and incomplete success `Data`.

**Alternatives considered**: E2E-only coverage was rejected because it is slower and does
not isolate transport, decoding, persistence, or guard failures.

## Legacy and implementation evidence

`reference-old/src/context/AuthProvider.jsx` reads `response.Status`,
`response.Message`, and `response.Data`, including `Data.ToChuc_Id`, `access_token`,
`refresh_token`, `exp_refresh`, `user_name`, `permissions`, and `user_id`; it also handles
`Status === -131`. `reference-old/src/screens/Login.jsx` remains the visual reference.
The current source and tests use the obsolete lowercase/flat shape across all auth
boundaries, so they must be changed as one coordinated implementation slice.
