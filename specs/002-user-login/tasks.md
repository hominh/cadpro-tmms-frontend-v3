---

description: "Dependency-ordered tasks for aligning the user-login backend contract"

---

# Tasks: User Login Contract Alignment

**Input**: Design documents from `specs/002-user-login/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md),
[research.md](./research.md), [data-model.md](./data-model.md),
[contracts/auth-login.md](./contracts/auth-login.md), [quickstart.md](./quickstart.md)

**Tests**: Included because FR-033 explicitly requires automated exact-case contract
examples and regression coverage, and the constitution requires validation of API,
storage, route, loading, error, and accessibility behavior.

**Organization**: Tasks are grouped by user story. Among the P1 stories, User Story 5 is
implemented first because its exact response contract is foundational for successful
login, failure handling, and route-access session validation. The existing Next.js,
shadcn/Tailwind, and TanStack Query infrastructure is retained.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its stated dependencies because it touches a
  different file and does not depend on another incomplete task in the same group.
- **[Story]**: Maps the task to the numbered user story in `spec.md`.
- Every task names an exact repository file path.

---

## Phase 1: Setup (Shared Test Inputs)

**Purpose**: Replace obsolete lowercase/flat test inputs with one canonical source of
exact-case response and stored-session examples before changing production boundaries.

- [X] T001 Replace shared auth payload/session builders with exact `Status`/`Message`/`Data` fixtures, complete nested success fields, `-131`, generic failure, lowercase-only, and incomplete-success variants in `tests/features/auth/fixtures.ts`

---

## Phase 2: Foundational (Blocking Types)

**Purpose**: Establish the single compile-time model required by every story.

**⚠️ CRITICAL**: Complete this phase before story implementation so API, mapper,
storage, route, hook, and UI consumers cannot retain incompatible schemas.

- [X] T002 Define case-sensitive raw envelope, validated `LoginSuccessData`, `LoginSuccessResponse`, allowlisted nested `StoredAuthSession`, business outcome, and normalized API error types in `src/features/auth/types.ts`

**Checkpoint**: Canonical fixtures and shared exact-case types are ready.

---

## Phase 3: User Story 5 - Accept the Backend Response Contract (Priority: P1) 🎯 Contract MVP

**Goal**: Accept complete uppercase backend responses, reject undocumented lowercase
aliases, and preserve all required `Data` fields without false `MALFORMED_RESPONSE`.

**Independent Test**: Pass a complete `Status: 1` payload through the API decoder and
response mapper and confirm all required nested fields are retained; repeat with a
lowercase-only envelope and incomplete success data and confirm both are malformed.

### Tests for User Story 5

- [X] T003 [P] [US5] Add API contract tests for exact uppercase success, reordered properties, lowercase-only rejection, missing `Status`, invalid JSON, and exact uppercase `Message` reads in `tests/features/auth/login-api.test.ts`
- [X] T004 [P] [US5] Add mapper tests for all required `Data` fields, null/non-object/partial success data, non-empty scalar validation, and empty `roles`/`permissions` arrays in `tests/features/auth/login-response.test.ts`

### Implementation for User Story 5

- [X] T005 [P] [US5] Parse response JSON as `unknown`, validate exact own fields `Status`/`Message`/`Data`, reject lowercase aliases, and keep HTTP transport classification separate from business `Status` in `src/features/auth/api/login.ts`
- [X] T006 [P] [US5] Implement outcome-aware success validation and map only the eight approved fields into nested `{ Status: 1, Data }` session data in `src/features/auth/mappers/login-response.ts`

**Checkpoint**: The authoritative wire contract is independently accepted and malformed
lowercase/partial responses are rejected.

---

## Phase 4: User Story 1 - Sign in Successfully (Priority: P1)

**Goal**: A valid exact-case response creates one safe nested session, exposes the
authenticated user context, and redirects to `/dashboard`.

**Independent Test**: Submit valid credentials against a mocked complete uppercase
response, then verify the allowlisted localStorage record, authenticated user name, and
dashboard redirect without a malformed-response error.

### Tests for User Story 1

- [X] T007 [P] [US1] Test atomic persistence of the nested allowlisted successful session and exclusion of password, `Message`, and unknown response fields in `tests/features/auth/auth-storage.test.ts`
- [X] T008 [P] [US1] Test that uppercase `Status: 1` stores every approved `Data` field and redirects exactly once to `/dashboard` in `tests/features/auth/use-login.test.tsx`
- [X] T009 [P] [US1] Update the browser login-success mock to the exact backend envelope and assert nested persisted user, organization, token, role, permission, and expiry data in `tests/e2e/login.spec.ts`

### Implementation for User Story 1

- [X] T010 [P] [US1] Update namespaced auth storage writes and typed reads to persist only `{ Status: 1, Data: approvedFields }` atomically in `src/lib/auth-storage.ts`
- [X] T011 [US1] Handle validated `Status: 1` in the TanStack Query mutation by mapping, persisting, and redirecting only after the complete session is available in `src/features/auth/hooks/use-login.ts`
- [X] T012 [P] [US1] Replace obsolete flattened `session.user` lookups with nested `session.Data.user_name` and approved role context in `src/components/layout/app-sidebar.tsx`

**Checkpoint**: Exact-case success works end to end and produces a complete safe session.

---

## Phase 5: User Story 2 - Handle Invalid Credentials (Priority: P1)

**Goal**: Business and transport failures remain distinct, use only safe uppercase
`Message`, preserve existing sessions, and never redirect or create partial auth state.

**Independent Test**: Exercise `Status: -131`, another non-success `Status`, an HTTP
failure, lowercase-only error data, and a network failure; verify the correct feedback,
no session write, no redirect, and completion of the pending state.

### Tests for User Story 2

- [X] T013 [P] [US2] Add API tests proving non-OK transport responses read only uppercase `Message`, retain parseable backend `Status`, and ignore lowercase `message` in `tests/features/auth/login-api.test.ts`
- [X] T014 [P] [US2] Add business-outcome tests for `Status: -131`, generic non-success `Status`, safe `Message` fallback, and no false malformed classification in `tests/features/auth/login-errors.test.ts`
- [X] T015 [P] [US2] Test that business, HTTP, network, invalid-JSON, and malformed-success failures never overwrite a valid existing nested session or navigate in `tests/features/auth/login-failure-flow.test.ts`

### Implementation for User Story 2

- [X] T016 [P] [US2] Preserve exact backend `Status` and uppercase `Message` through normalized HTTP/network error handling without reading lowercase fields in `src/features/auth/api/login.ts`
- [X] T017 [US2] Handle `Status: -131`, generic business failures, malformed responses, and transport errors without persistence or navigation in `src/features/auth/hooks/use-login.ts`
- [X] T018 [P] [US2] Render the exact two-factor-development message and safe recoverable error status with existing accessible shadcn form feedback in `src/features/auth/components/login-form.tsx`

**Checkpoint**: Every failure outcome is recoverable and cannot corrupt authentication state.

---

## Phase 6: User Story 4 - Protect Authenticated Routes (Priority: P1)

**Goal**: Route decisions use the same nested exact-case stored-session schema as login;
stale lowercase or partial records are anonymous.

**Independent Test**: Seed a complete nested session and verify protected access plus
`/` and `/login` redirects; repeat with malformed JSON, lowercase/flat records, null or
partial `Data`, and empty required values and verify redirect to `/login` without content flash.

### Tests for User Story 4

- [X] T019 [P] [US4] Add stored-session read tests for exact nested success, stale lowercase/flat data, malformed JSON, primitives, null/partial `Data`, empty tokens/context, and empty role/permission arrays in `tests/features/auth/auth-storage.test.ts`
- [X] T020 [P] [US4] Update route-access unit tests so only the exact valid `Status: 1` plus complete nested `Data` shape is authenticated in `tests/features/auth/route-access.test.ts`
- [X] T021 [P] [US4] Seed exact nested valid sessions and lowercase/partial invalid sessions in browser route-protection scenarios in `tests/e2e/route-protection.spec.ts`

### Implementation for User Story 4

- [X] T022 [P] [US4] Runtime-validate untrusted localStorage reads against the canonical nested session type and ignore or clear stale invalid records in `src/lib/auth-storage.ts`
- [X] T023 [US4] Update route classification to require `Status === 1`, complete nested `Data`, non-empty identity/organization/tokens, array roles/permissions, and valid `exp_refresh` in `src/features/auth/route-access.ts`
- [X] T024 [US4] Verify the client guard consumes the updated route-access result without rendering protected content during checking or introducing redirect loops in `src/components/auth/route-guard.tsx`

**Checkpoint**: Login persistence and route protection agree on one exact session model.

---

## Phase 7: User Story 3 - Understand Form and Loading State (Priority: P2)

**Goal**: Contract migration preserves validation, loading, duplicate-submit prevention,
keyboard access, and visible completion states without redesigning the legacy-derived UI.

**Independent Test**: Submit missing fields and a delayed exact-case response using only
the keyboard; verify no invalid request, one pending mutation, disabled/loading feedback,
and return to a non-loading success or error state.

### Tests for User Story 3

- [X] T025 [P] [US3] Re-run and update required-field and no-API-call assertions against the migrated auth types in `tests/components/login-form-validation.test.tsx`
- [X] T026 [P] [US3] Re-run and update pending, duplicate-submit, settled-success, settled-business-error, and settled-transport-error assertions in `tests/components/login-form-loading.test.tsx`
- [X] T027 [P] [US3] Verify keyboard submission, accessible names/status announcements, machineCode inclusion, and exact-case completion behavior in `tests/e2e/login.spec.ts`

### Implementation for User Story 3

- [X] T028 [US3] Preserve the existing shadcn `Input`, `Button`, and form-feedback composition, pending disablement, and legacy `reference-old/src/screens/Login.jsx` layout while adapting any migrated outcome props in `src/features/auth/components/login-form.tsx`

**Checkpoint**: The response fix introduces no loading, accessibility, or visual regression.

---

## Phase 8: Polish & Cross-Cutting Validation

**Purpose**: Remove stale schema assumptions and validate the complete feature against
the contract, quickstart, and project constitution.

- [X] T029 [P] Replace any remaining lowercase-envelope or flat camelCase auth fixtures and assertions with exact-case contract examples, retaining lowercase only in explicit rejection cases, across `tests/features/auth/` and `tests/e2e/`
- [X] T030 Run lint, TypeScript checking, and unit/component auth tests using the scripts in `package.json`, resolving contract-migration failures in `src/features/auth/`, `src/lib/auth-storage.ts`, and affected tests
- [X] T031 Run Playwright login/route-protection scenarios and the Next.js production build using `playwright.config.ts` and `package.json`, resolving any integration or build regression
- [X] T032 Execute every scenario in `specs/002-user-login/quickstart.md` and record any verified deviation or constitution exception in `specs/002-user-login/plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately and establishes canonical fixtures.
- **Foundational (Phase 2)**: Depends on T001 and blocks all user-story implementation.
- **US5 (Phase 3)**: Depends on T002; establishes the contract decoder and success mapper.
- **US1 (Phase 4)**: Depends on US5; persists and consumes validated success data.
- **US2 (Phase 5)**: Depends on US5 and the US1 mutation/storage boundary; adds failure outcomes.
- **US4 (Phase 6)**: Depends on US1's stored-session representation; independent of US2 UI work.
- **US3 (Phase 7)**: Depends on the final US1/US2 mutation outcomes; verifies unchanged form behavior.
- **Polish (Phase 8)**: Depends on all selected user-story phases.

### User Story Completion Order

```text
Setup → Foundational → US5 → US1 → US2 → US3
                              └──→ US4
US2 + US3 + US4 → Polish
```

- **US5 (P1)**: First among equal-priority stories because every other auth boundary
  requires the authoritative decoder and mapper.
- **US1 (P1)**: Requires US5; delivers the usable successful-login increment.
- **US2 (P1)**: Requires shared US1 mutation/storage integration but is independently
  verified with failed responses.
- **US4 (P1)**: Requires only the US1 stored-session shape and may proceed in parallel with US2.
- **US3 (P2)**: Runs after outcome handling stabilizes and independently verifies form behavior.

### Within Each User Story

- Write/update the listed tests first and observe the expected regression failure.
- Implement types/decoder before mapper, mapper before persistence, and persistence before route consumers.
- Complete the independent test before moving to the next dependent story.
- Tasks sharing a file across phases are intentionally sequential; `[P]` only marks
  work on separate files that is safe at that point.

### Parallel Opportunities

- After T002, T003/T004 and then T005/T006 can run as file-isolated pairs.
- In US1, T007-T009 can run together; T010 and T012 can run together before T011 integration.
- In US2, T013-T015 can run together; T016 and T018 can run together before T017 integration.
- US4 can proceed in parallel with US2 after US1 is complete; T019-T021 are parallel test tasks.
- In US3, T025-T027 can run together before T028.
- T029 can run independently before the serial full validation tasks T030-T032.

## Parallel Example: User Story 5

```text
Task T003: API casing and malformed-envelope tests in tests/features/auth/login-api.test.ts
Task T004: Complete Data validation tests in tests/features/auth/login-response.test.ts
```

## Parallel Example: User Story 1

```text
Task T007: Nested auth-storage write tests in tests/features/auth/auth-storage.test.ts
Task T008: Successful mutation tests in tests/features/auth/use-login.test.tsx
Task T009: Exact-case browser success mock in tests/e2e/login.spec.ts
```

## Parallel Example: User Story 2

```text
Task T013: HTTP/backend status separation tests in tests/features/auth/login-api.test.ts
Task T014: Business outcome tests in tests/features/auth/login-errors.test.ts
Task T015: Existing-session preservation tests in tests/features/auth/login-failure-flow.test.ts
```

## Parallel Example: User Story 4

```text
Task T019: Untrusted stored-session tests in tests/features/auth/auth-storage.test.ts
Task T020: Route policy unit tests in tests/features/auth/route-access.test.ts
Task T021: Browser route-protection seeds in tests/e2e/route-protection.spec.ts
```

## Parallel Example: User Story 3

```text
Task T025: Form validation regression in tests/components/login-form-validation.test.tsx
Task T026: Loading/settled regression in tests/components/login-form-loading.test.tsx
Task T027: Keyboard/accessibility browser regression in tests/e2e/login.spec.ts
```

## Implementation Strategy

### Contract MVP

1. Complete T001-T002.
2. Complete US5 (T003-T006) and prove exact uppercase success no longer produces
   `MALFORMED_RESPONSE`.
3. Complete US1 (T007-T012) to deliver usable persistence and redirect.
4. Stop and validate the US5 + US1 slice independently before expanding failure/route behavior.

### Incremental Delivery

1. **US5**: Correct wire decoding and success mapping.
2. **US1**: Persist the safe nested session and redirect.
3. **US2**: Add complete business/transport failure behavior.
4. **US4**: Align stored-session route protection; may run alongside US2.
5. **US3**: Confirm loading, validation, accessibility, and visual behavior are unchanged.
6. **Polish**: Remove stale fixtures and run all quickstart/quality gates.

### Suggested MVP Scope

The smallest deployable fix is **Setup + Foundational + US5 + US1 (T001-T012)**. US5
alone proves the contract regression is corrected, while US1 makes that correction usable
through persistence, authenticated context, and dashboard navigation.

## Notes

- Use Next.js commands and paths only; Vitest may use Vite internals solely as test tooling.
- Keep TanStack Query in `src/features/auth/hooks/use-login.ts`; do not add component-level fetches.
- Do not introduce Flowbite React or redesign the login form. Reuse existing shadcn UI
  and preserve `reference-old/src/screens/Login.jsx` layout, spacing, sizing, style, and colors.
- Preserve lowercase examples only where a test explicitly proves they are rejected.
- Do not persist `Message`, credentials, or unknown backend fields.
