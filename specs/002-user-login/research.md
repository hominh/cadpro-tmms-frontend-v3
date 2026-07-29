# Research: User Login

## Decision: Use a TanStack Query mutation for login

**Rationale**: Login is a server-side side effect, not a read query. TanStack Query
recommends `useMutation` for server side effects and exposes pending, error, success, and
settled lifecycle states that map directly to the login UI.

**Alternatives considered**: Direct `fetch` in the form was rejected because it duplicates
request lifecycle handling and violates the project constitution. A query was rejected
because login submits credentials and changes authentication state.

**Reference**: [TanStack Query Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)

## Decision: Compose shadcn form primitives and Tailwind layout utilities

**Rationale**: shadcn's form guidance supports composing field, label, control, and error
patterns. Existing shadcn primitives remain the first choice; Tailwind utilities provide
responsive layout and visual state treatment without a second styling system.

**Alternatives considered**: A custom form system was rejected because it increases
maintenance and visual inconsistency. A separate CSS layout layer was rejected because
Tailwind is the project styling constraint.

**References**: [shadcn/ui Forms](https://ui.shadcn.com/docs/forms),
[Tailwind CSS](https://tailwindcss.com/docs/functions-and-directives)

## Decision: Isolate unknown backend details behind adapters

**Rationale**: The user explicitly deferred the endpoint and response shape. The form and
mutation lifecycle can be implemented against typed adapter boundaries while the concrete
endpoint, request fields, response mapping, and redirect route are updated in one place
when backend information becomes available.

**Alternatives considered**: Inventing an endpoint or response schema was rejected because
it creates false integration certainty. Scattering placeholders through UI components was
rejected because later backend changes would increase the change surface.

## Decision: Persist the approved backend response through one storage adapter

**Rationale**: The user requires localStorage persistence. One adapter can namespace the
record, validate the response mapper output, exclude passwords/secrets, replace stale
session data only after success, and clean up consistently.

**Alternatives considered**: Writing unrelated localStorage keys was rejected because
partial writes can create inconsistent sessions. Cookie-only storage was rejected because
it does not satisfy the stated requirement.

## Decision: Use a client-side route guard for localStorage-based access control

**Rationale**: `localStorage` is available only in the browser, so server middleware
cannot reliably make the session decision. A client guard can wait in a checking state,
read and validate the namespaced session, render no protected content during the check,
then redirect anonymous users to `/login` or authenticated users from `/` and `/login` to
`/dashboard`.

**Alternatives considered**: Middleware-only protection was rejected because it cannot read
localStorage. Rendering protected pages first and redirecting afterward was rejected
because it can briefly expose protected content and create a visible flash.

## Deferred integration input

Before implementation, the backend owner must provide the endpoint path, HTTP method,
request fields, success response shape, error response shape, token field semantics, and
the expected main-page redirect route. These values are recorded as TBD in the contract
artifact and are not treated as implementation blockers for the UI structure plan.
