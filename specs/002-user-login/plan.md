# Implementation Plan: User Login

**Branch**: `minh_dev` | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-user-login/spec.md`

## Summary

Implement the login flow and route-access boundary as a feature-level authentication
boundary. The form will
compose reusable shadcn UI primitives and use Tailwind CSS utilities for layout and
visual states. A TanStack Query `useMutation` will call the backend login API, expose
pending and error states, and handle the success side effect of persisting the agreed
backend response in a namespaced localStorage record before redirecting to the main page.

The endpoint path and response shape are intentionally deferred by the user. They will
be injected through one API adapter and one response/storage mapper once the backend
contract is provided; the UI and mutation lifecycle must not depend on hard-coded endpoint
details. Every route is protected by default except explicitly public routes. A
client-side route guard will inspect the localStorage session before rendering protected
content, redirect anonymous users to `/login`, and redirect authenticated users from `/`
or `/login` to `/dashboard`.

## Technical Context

**Language/Version**: TypeScript with the repository's planned Next.js frontend; no
application package manifest is present yet

**Primary Dependencies**: Next.js, Tailwind CSS, shadcn UI, TanStack Query,
`@fingerprintjs/fingerprintjs@5.2.0`, and the project's selected form validation utility

**Storage**: Browser localStorage under one namespaced authentication record containing
the backend-approved successful response; password and any backend-declared secret fields
MUST NOT be persisted

**Testing**: Component tests for validation and UI states, mutation tests with mocked
endpoint/response adapters, and an end-to-end login smoke scenario once the backend
contract and test runner are available

**Target Platform**: Modern browsers supported by the Next.js application

**Project Type**: Web application feature

**Performance Goals**: The submit control changes to the pending state immediately, and
successful login redirects within 5 seconds under normal backend conditions

**Constraints**: The login endpoint URL is configured through
`NEXT_PUBLIC_LOGIN_API_URL`; request body is `{ username, password, machineCode }`.
`machineCode` comes from FingerprintJS `visitorId`. `status = 1` redirects to `/dashboard`;
`status = -131` displays the specified 2FA-in-development message. localStorage is an
explicit product constraint with an XSS exposure trade-off; automatic refresh-token
renewal is not implemented in this feature. Because localStorage is browser-only, route
protection uses a client guard with a checking state; middleware is not used as the sole
session authority.

**Scale/Scope**: One login route, one login mutation, one auth API adapter, one response
mapper/storage boundary, one reusable form composition, and one redirect target

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Next.js architecture**: PASS. The route and client-interactive boundary are isolated
  in the feature structure documented below.
- **Tailwind and shadcn**: PASS. The form MUST compose existing shadcn primitives and
  Tailwind utilities; custom primitives require justification.
- **TanStack Query**: PASS. Login is modeled as a `useMutation`, with pending, error,
  success, and settled side effects defined outside ad hoc component fetching.
- **Reusable components**: PASS. Input/form primitives remain reusable; auth-specific
  behavior is kept in the login feature hook and storage adapter.
- **Quality and accessibility**: PASS. Required, invalid, pending, service-error, success,
  and route-checking states plus keyboard and accessible-name behavior are included in
  validation.
- **Backend contract dependency**: PASS with explicit gate. Implementation cannot begin
  until endpoint and response details are supplied and mapped in the contract file.
- **Security exception**: Documented. localStorage is required by the user request; the
  storage boundary is namespaced, excludes passwords/secrets, and must document lifetime
  and cleanup. Automatic refresh is explicitly out of scope.

## Project Structure

### Documentation (this feature)

```text
specs/002-user-login/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── auth-login.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
src/
├── app/(auth)/login/page.tsx              # Login route and page composition
├── components/ui/                         # Existing shadcn primitives
├── features/auth/
│   ├── api/login.ts                        # Backend request adapter
│   ├── hooks/use-login.ts                 # TanStack Query mutation
│   ├── components/login-form.tsx          # Form composition and states
│   ├── mappers/login-response.ts          # Backend response to storage model
│   ├── machine-code.ts                    # FingerprintJS visitorId generation
│   └── types.ts                            # Request/response boundary types
└── lib/auth-storage.ts                    # Namespaced localStorage boundary

tests/
├── components/login-form.test.tsx
├── features/auth/use-login.test.ts
└── e2e/login.spec.ts
```

If the repository uses `app/` rather than `src/app/`, the same ownership boundaries apply
with the actual root selected during implementation. No source tree exists yet, so these
paths are the proposed structure rather than existing files.

**Structure Decision**: Keep the route thin, put API and TanStack Query behavior in the
auth feature, and isolate localStorage access behind one adapter. The UI composes shadcn
controls and uses Tailwind only for layout and visual state classes. Backend-specific
details remain in the API adapter and response mapper.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| localStorage session persistence | Explicit user requirement | A secure cookie would reduce token exposure but does not satisfy the requested client storage behavior |
