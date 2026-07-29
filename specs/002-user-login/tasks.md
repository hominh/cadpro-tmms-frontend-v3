---

description: "Dependency-ordered implementation tasks for user login"

---

# Tasks: User Login

**Input**: Design documents from `specs/002-user-login/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Included because the plan and constitution require validation of login states,
API mutation behavior, storage safety, and accessibility.

**Organization**: Tasks are grouped by user story. Shared infrastructure and the backend
contract gate are completed before story implementation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the frontend dependencies and validation tools required by the
login feature.

- [X] T001 Initialize the Next.js TypeScript application and package manifest in `package.json`, including `@fingerprintjs/fingerprintjs` pinned to `5.2.0`
- [X] T002 [P] Configure Tailwind CSS in `tailwind.config.*`, `postcss.config.*`, and `src/app/globals.css`
- [X] T003 [P] Configure shadcn UI metadata and shared styling in `components.json` and `src/lib/utils.ts`
- [X] T004 [P] Install and configure the TanStack Query provider in `src/app/providers.tsx` and `src/app/layout.tsx`
- [X] T005 [P] Configure component/unit test tooling in `vitest.config.*` and `tests/setup.*`
- [X] T006 [P] Configure end-to-end test tooling in `playwright.config.*`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the contract, types, storage boundary, and API error boundary that
all login stories depend on.

**⚠️ CRITICAL**: Backend-dependent implementation tasks MUST NOT begin until T007 has
replaced the TBD values in `contracts/auth-login.md`.

- [X] T007 Confirm the backend request body, status handling, token/user response, FingerprintJS machine code, 2FA message, environment endpoint, and dashboard redirect in `specs/002-user-login/contracts/auth-login.md`
- [X] T008 [P] Define backend boundary, login request, login response, safe session, and normalized error types in `src/features/auth/types.ts`
- [X] T009 [P] Implement namespaced localStorage read/write/clear operations with password and secret-field exclusion in `src/lib/auth-storage.ts`
- [X] T010 [P] Implement the backend login request adapter with `{ username, password, machineCode }` and normalized error mapping using the confirmed contract in `src/features/auth/api/login.ts`
- [X] T011 Add response validation and safe-session mapping from backend payload to storage payload in `src/features/auth/mappers/login-response.ts`
- [X] T012 Add FingerprintJS visitorId generation and machineCode error handling in `src/features/auth/machine-code.ts`
- [X] T013 Add shared authentication test fixtures for status 1, status -131, invalid credentials, service failure, and malformed response in `tests/features/auth/fixtures.ts`

**Checkpoint**: Contract and shared authentication boundaries are ready; user-story work
can proceed in priority order.

---

## Phase 3: User Story 1 - Sign in Successfully (Priority: P1) 🎯 MVP

**Goal**: A registered user can submit valid credentials, persist the approved backend
response, and reach the main page.

**Independent Test**: Mock a confirmed successful backend response, submit valid
credentials, verify the namespaced localStorage session, and verify redirect to the
confirmed main-page route.

### Tests for User Story 1

- [X] T014 [P] [US1] Test successful status 1 response validation and safe-session mapping in `tests/features/auth/login-response.test.ts`
- [X] T015 [P] [US1] Test that the auth storage adapter persists only the approved response and excludes password/secret fields in `tests/features/auth/auth-storage.test.ts`
- [X] T016 [P] [US1] Test login mutation success, storage side effect, and dashboard redirect callback in `tests/features/auth/use-login.test.tsx`

### Implementation for User Story 1

- [X] T017 [US1] Implement the TanStack Query `useMutation` hook with machineCode generation, status 1 success, error, settled, and duplicate-submit behavior in `src/features/auth/hooks/use-login.ts`
- [X] T018 [US1] Implement the login page route and authenticated redirect boundary in `src/app/(auth)/login/page.tsx`
- [X] T019 [US1] Compose the shadcn-based login form with username/password fields, submit action, and Tailwind layout in `src/features/auth/components/login-form.tsx`
- [X] T020 [US1] Add the fixed `/dashboard` route or redirect target integration in `src/app/dashboard/page.tsx`

**Checkpoint**: Valid credentials create a complete safe session and redirect successfully.

---

## Phase 4: User Story 2 - Handle Invalid Credentials (Priority: P1)

**Goal**: Invalid credentials and service failures produce clear, safe feedback without
creating a session or redirecting.

**Independent Test**: Mock invalid-credential, network, server, and malformed-response
failures and verify each normalized outcome in the login form.

### Tests for User Story 2

- [X] T021 [P] [US2] Test normalized invalid-credential, service-error, and status -131 mapping in `tests/features/auth/login-errors.test.ts`
- [X] T022 [P] [US2] Test that failed login attempts preserve existing storage and do not redirect in `tests/features/auth/login-failure-flow.test.ts`

### Implementation for User Story 2

- [X] T023 [US2] Render safe invalid-credential, service-error, and exact status -131 2FA-in-development messages without exposing password or token values in `src/features/auth/components/login-form.tsx`
- [X] T024 [US2] Ensure mutation failure, status -131, and malformed success responses leave storage unchanged and keep the user on the login route in `src/features/auth/hooks/use-login.ts`
- [X] T025 [US2] Add accessible error/status announcements and focus behavior for login failures in `src/features/auth/components/login-form.tsx`

**Checkpoint**: Failed authentication is recoverable, clearly explained, and cannot
create a partial session.

---

## Phase 5: User Story 3 - Understand Form and Loading State (Priority: P2)

**Goal**: Users receive immediate validation and loading feedback and cannot submit the
same login request repeatedly.

**Independent Test**: Submit missing fields and use a delayed mutation response while
navigating by keyboard; verify validation, pending state, and completion state.

### Tests for User Story 3

- [X] T026 [P] [US3] Test required-field validation and no-API-call behavior in `tests/components/login-form-validation.test.tsx`
- [X] T027 [P] [US3] Test pending, disabled-submit, keyboard-submit, and settled states in `tests/components/login-form-loading.test.tsx`
- [X] T028 [P] [US3] Test login flow keyboard accessibility, machineCode request inclusion, and accessible names in `tests/e2e/login.spec.ts`

### Implementation for User Story 3

- [X] T029 [US3] Add field-level validation for username and password and connect validation errors to shadcn form controls in `src/features/auth/components/login-form.tsx`
- [X] T030 [US3] Add Tailwind loading layout, pending label, disabled control state, and completion-state cleanup in `src/features/auth/components/login-form.tsx`
- [X] T031 [US3] Enforce one active login mutation and reset pending state after success, status -131, failure, or network interruption in `src/features/auth/hooks/use-login.ts`

**Checkpoint**: The login form is understandable, keyboard usable, and robust during
slow or repeated interaction.

---

## Phase 6: User Story 4 - Protect Authenticated Routes (Priority: P1)

**Goal**: Anonymous users cannot render protected content, while authenticated users are
redirected from `/` or `/login` to `/dashboard` without redirect loops.

**Independent Test**: With no or malformed localStorage session, open `/dashboard` and
another protected route and confirm redirect to `/login` without protected-content flash;
with a valid session, open `/` and `/login` and confirm redirect to `/dashboard`.

### Tests for User Story 4

- [X] T032 [P] [US4] Add e2e coverage for anonymous access to `/dashboard` and another protected route, asserting redirect to `/login` and no protected content in `tests/e2e/route-protection.spec.ts`
- [X] T033 [P] [US4] Add e2e coverage for authenticated access to `/` and `/login`, asserting redirect to `/dashboard` and no redirect loop in `tests/e2e/route-protection.spec.ts`
- [X] T034 [P] [US4] Test missing, malformed, and incomplete auth sessions as anonymous route-access decisions in `tests/features/auth/route-access.test.ts`

### Implementation for User Story 4

- [X] T035 [US4] Implement route classification and validated checking/anonymous/authenticated access decisions in `src/features/auth/route-access.ts`
- [X] T036 [US4] Implement a client-side route guard that blocks protected-content render during session checking and redirects per policy in `src/components/auth/route-guard.tsx`
- [X] T037 [US4] Integrate the route guard into the root app shell while preserving `/login` as a public route in `src/app/layout.tsx` and `src/app/(auth)/login/page.tsx`

**Checkpoint**: Protected routes are guarded by default, invalid sessions are treated as
anonymous, and authenticated entry routes land on `/dashboard`.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete flow and keep documentation aligned with the confirmed
backend contract.

- [X] T038 [P] Update `specs/002-user-login/contracts/auth-login.md` and `specs/002-user-login/quickstart.md` with the configured endpoint and response examples
- [X] T039 [P] Add login route, API failure, status -131, storage cleanup, machineCode, route-protection, and accessibility verification to `specs/002-user-login/quickstart.md`
- [ ] T040 Run lint, type-check, unit/component tests, end-to-end login smoke tests, route-protection smoke tests, and build using the commands defined in `package.json`
- [X] T041 Review `src/features/auth/`, `src/components/ui/`, `src/components/auth/`, and `src/app/` for constitution compliance and document any justified exception in `specs/002-user-login/plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; initializes the application and tooling.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user-story work. T007 is
  the backend contract gate.
- **User Story 1 (Phase 3)**: Depends on T007-T012 and is the MVP increment.
- **User Story 2 (Phase 4)**: Depends on the shared mutation and form from Phase 3; it
  extends failure handling for the same login flow.
- **User Story 3 (Phase 5)**: Depends on the shared form and mutation from Phase 3; it
  hardens validation, loading, and accessibility behavior.
- **User Story 4 (Phase 6)**: Depends on Foundational storage/session boundaries and can
  be validated independently with seeded auth state.
- **Polish (Phase 7)**: Depends on all desired user stories.

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational; no dependency on US2 or US3.
- **US2 (P1)**: Uses US1's mutation and form boundary, then adds failure behavior.
- **US3 (P2)**: Uses US1's form and mutation boundary, then adds validation/loading and
  accessibility hardening.
- **US4 (P1)**: Can start after Foundational using the shared auth storage contract; it
  does not require US2 or US3 to be complete.

### Parallel Opportunities

- T002-T006 can run in parallel after T001 when they touch separate configuration files.
- T008-T010 and T012 can run in parallel after T007.
- T013 can complete after T008-T012 establishes the shared auth boundary.
- T014-T016 can run in parallel after T013.
- T021-T022 can run in parallel after US1 establishes the shared login flow.
- T026-T028 can run in parallel after the login form route exists.
- T032-T034 can run in parallel after the auth storage contract is stable.
- T038-T039 can run in parallel after the final backend contract and route policy are confirmed.

## Parallel Example: User Story 1

```text
Task: T014 response mapper tests in tests/features/auth/login-response.test.ts
Task: T015 auth storage tests in tests/features/auth/auth-storage.test.ts
Task: T016 mutation success tests in tests/features/auth/use-login.test.tsx
```

## Parallel Example: User Story 4

```text
Task: T032 anonymous route-protection e2e coverage in tests/e2e/route-protection.spec.ts
Task: T033 authenticated entry-route e2e coverage in tests/e2e/route-protection.spec.ts
Task: T034 route-access session classification tests in tests/features/auth/route-access.test.ts
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 and confirm the backend contract in T007.
3. Complete US1 and validate successful login independently.
4. Stop and verify localStorage safety, redirect, and authenticated context.

### Incremental Delivery

1. Add US1 for successful login and release/demo the core flow.
2. Add US2 for invalid credentials and service failures.
3. Add US3 for validation, loading, keyboard, and accessibility hardening.
4. Add US4 for default-protected routes and authenticated entry redirects.
5. Complete polish validation and update contract documentation.

## Notes

- Every task includes an exact file path or a clearly identified repository path.
- No task may invent the backend endpoint, response shape, or route-access policy; T007
  confirms the backend contract before those values are used in source code.
- The feature MUST reuse shadcn UI primitives, use Tailwind for layout, and use TanStack
  Query for the login API mutation.
- Only T040 remains open. On July 29, 2026, Playwright still timed out waiting for the
  Next.js web server and `npm run build` exceeded the execution window in this
  environment, while lint, type-check, and unit/component tests passed for the completed
  scope.
