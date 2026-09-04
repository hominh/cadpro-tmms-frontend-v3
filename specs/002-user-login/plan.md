# Implementation Plan: User Login Contract Alignment

**Branch**: `002-user-login` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-user-login/spec.md`

## Summary

Correct the implemented authentication boundary so it consumes the backend's exact,
case-sensitive `Status` / `Message` / `Data` envelope end to end. A successful
`Status: 1` response is validated before an allowlisted session with the same nesting
and backend field names is persisted. Business failures, including `Status: -131`, are
handled independently from HTTP transport failures. Shared types, API parsing, mapping,
TanStack Query outcome handling, storage, route access, fixtures, and automated tests
are updated together so a valid backend response cannot be misclassified as
`MALFORMED_RESPONSE`.

The existing Next.js + shadcn login UI and route behavior remain unchanged. The legacy
visual reference remains `reference-old/src/screens/Login.jsx`; this contract amendment
does not authorize a redesign.

## Technical Context

**Language/Version**: TypeScript 5.8.3, Next.js 15.5.6, React 19.1

**Primary Dependencies**: Tailwind CSS 4, shadcn UI, TanStack Query 5.83,
React Hook Form, Zod 4, `@fingerprintjs/fingerprintjs` 5.2

**Storage**: Browser localStorage under the existing namespaced authentication key. The
stored value is an allowlisted successful envelope containing `Status: 1` and validated
`Data`; credentials, `Message`, and unapproved response fields are excluded.

**Testing**: Vitest 3.2 for unit/component tests and Playwright 1.54 for browser flows

**Target Platform**: Modern browsers supported by the Next.js application

**Project Type**: Existing Next.js web application

**Performance Goals**: Preserve immediate pending feedback and redirect within 5 seconds
under normal backend conditions; contract validation adds no additional network round trip.

**Constraints**: The endpoint remains configured by `NEXT_PUBLIC_LOGIN_API_URL`; request
body remains `{ username, password, machineCode }`. JSON is parsed as `unknown` and
validated with exact property names. `Status` controls the business outcome while the
HTTP status controls transport classification. `Data` is fully required only for
`Status: 1`; lowercase aliases are rejected. Automatic refresh-token renewal remains out
of scope. Because localStorage is browser-only, route protection remains client-side.
Vitest's Vite plugin is test tooling only and is not an application framework.

**Scale/Scope**: One API boundary, shared auth types, one response mapper, one mutation
hook, one storage adapter, one route-access policy, one authenticated sidebar consumer,
and the corresponding unit/component/E2E fixtures and tests

## Constitution Check

*GATE: Passed before Phase 0 research and re-checked after Phase 1 design.*

- **Next.js architecture**: PASS. Work remains within the existing Next.js App Router
  application; no Vite application configuration is introduced.
- **shadcn UI and legacy design fidelity**: PASS. This is a contract-only correction.
  Existing Tailwind/shadcn UI is preserved and `reference-old/src/screens/Login.jsx`
  remains the visual reference.
- **TanStack Query**: PASS. Login continues to use the existing `useMutation`; parsing
  and persistence are kept outside the form component.
- **Reusable components**: PASS. One canonical contract/type model is shared by API,
  mapper, storage, route-access, and authenticated UI consumers.
- **Quality and accessibility**: PASS. Existing keyboard, validation, pending, and error
  behavior is preserved; regression coverage is added for exact casing and every outcome.
- **Backend contract**: PASS. The authoritative envelope and required success fields are
  recorded in [contracts/auth-login.md](./contracts/auth-login.md); no integration field
  remains TBD.
- **Security exception**: PASS with documented trade-off. localStorage is an explicit
  product constraint. Only an allowlisted successful session is stored; password,
  backend message, and unknown fields are not persisted, and invalid/stale data is ignored
  or cleared. A secure HttpOnly cookie remains preferable but is outside this feature.

## Project Structure

### Documentation (this feature)

```text
specs/002-user-login/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/auth-login.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
src/
├── app/(auth)/login/page.tsx
├── components/layout/app-sidebar.tsx           # Authenticated user-name consumer
├── components/ui/                              # Existing shadcn primitives
├── features/auth/
│   ├── api/login.ts                            # HTTP and exact-envelope decoder
│   ├── components/login-form.tsx               # Existing UI; no redesign
│   ├── hooks/use-login.ts                      # Business-outcome handling
│   ├── mappers/login-response.ts               # Valid success → stored session
│   ├── machine-code.ts
│   ├── route-access.ts                         # Stored-session validation/redirects
│   └── types.ts                                # Raw, success, and stored types
└── lib/auth-storage.ts                         # Namespaced persistence boundary

tests/
├── components/login-form.test.tsx
├── features/auth/
│   ├── fixtures.ts
│   ├── login-api.test.ts
│   ├── login-response.test.ts
│   ├── login-errors.test.ts
│   ├── login-failure-flow.test.ts
│   ├── auth-storage.test.ts
│   ├── route-access.test.ts
│   └── use-login.test.tsx
└── e2e/
    ├── login.spec.ts
    └── route-protection.spec.ts
```

**Structure Decision**: Keep the route and form thin. Decode the wire envelope once in
the auth API boundary, narrow successful data through a dedicated mapper, write only an
allowlisted nested session through the storage adapter, and make route/sidebar consumers
use that same type. This prevents separate lowercase, camelCase, or flattened schemas
from drifting apart.

## Phase 0: Research Decisions

Research resolves the contract boundary, outcome rules, storage representation, and
test matrix in [research.md](./research.md). There are no remaining clarifications.

## Phase 1: Design

1. Define the exact envelope, validated success data, stored session, and login outcome
   entities in [data-model.md](./data-model.md).
2. Make [contracts/auth-login.md](./contracts/auth-login.md) authoritative for request,
   successful response, business failure, two-factor status, transport failure, and
   malformed response behavior.
3. Update shared types and parse `response.json()` as `unknown`; require an object with
   exact `Status`, `Message`, and outcome-appropriate `Data` fields. Do not support
   lowercase aliases.
4. For `Status: 1`, validate every required `Data` field, map an allowlisted nested
   session, persist it atomically, then redirect to `/dashboard`.
5. Preserve `Status: -131` through the transport boundary and show the defined message.
   For other business failures, use only safe uppercase `Message`; never overwrite a
   valid existing session on failure.
6. Validate stored sessions with the same `Status`/`Data` schema. Missing, stale
   lowercase, partial, or malformed records are anonymous. Update authenticated UI
   consumers to read `Data.user_name` and other nested fields.
7. Replace canonical fixtures and add layered regression tests across API parsing,
   mapping, mutation effects, persistence, route access, and Playwright flows as listed
   in [quickstart.md](./quickstart.md).

## Post-Design Constitution Re-check

All gates remain PASS. The design introduces no application framework, UI library,
visual deviation, direct component-level fetching, or duplicate contract model. The only
recorded exception remains the explicitly required localStorage session.

## Implementation Validation (2026-08-14)

- `npm run lint`: PASS.
- `npm run type-check`: PASS.
- `npm test`: PASS, 10 files and 69 tests.
- `npm run test:e2e -- tests/e2e/login.spec.ts tests/e2e/route-protection.spec.ts`:
  PASS, 6 Chromium scenarios.
- `npm run build`: PASS. An already-running development process held
  `.next-cache/trace`, so validation used a temporary isolated Next.js output directory;
  `next.config.ts` and `tsconfig.json` were restored afterward and the temporary output
  was removed.
- Quickstart contract, business-error, storage, route, loading, accessibility, and
  lowercase-rejection scenarios are covered by the passing automated suite. No UI,
  constitution, or backend-contract deviation was found.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| localStorage session persistence | Explicit product requirement | An HttpOnly secure cookie reduces script exposure but does not satisfy the specified client-storage contract |
