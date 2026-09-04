# Tasks: Sidebar Legacy Design and Interaction Parity

**Input**: Design documents from `/specs/004-sidebar-legacy-parity/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/sidebar-navigation.md`, `quickstart.md`

**Tests**: Required by the feature specification, constitution, UI contract, and quickstart validation guide. Write each story's tests first and confirm they fail for the intended reason before implementation.

**Organization**: Tasks are grouped by user story so each increment can be implemented and validated independently. All UI work must compare against `reference-old/src/components/Menu.jsx` and use the existing Tailwind/shadcn system without Flowbite.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes a different file and has no dependency on another incomplete task in the same phase.
- **[Story]**: Maps work to a user story from `spec.md`.
- Every task names the exact repository path it changes.

## Phase 1: Setup (Shared Test Infrastructure)

**Purpose**: Prepare deterministic sidebar tests without changing runtime behavior.

- [x] T001 [P] Create a reusable sidebar render harness with mocked Next pathname/router, auth storage, portal cleanup, and collapsed-state controls in tests/components/sidebar-test-utils.tsx
- [x] T002 [P] Add empty, limited, malformed, and full legacy permission fixtures plus representative role/user sessions in tests/features/layout/sidebar-fixtures.ts
- [x] T003 [P] Add the 34-leaf legacy destination inventory, including duplicate `/electronic-board`, `/map`, `/statistic`, and the bus-route special case, in tests/features/layout/destination-fixtures.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared navigation metadata and activation behavior required by every renderer.

**⚠️ CRITICAL**: Complete this phase before starting any user story.

- [x] T004 Extend `MenuItem` with unique identity, `legacyPath`, `permissionCode`, `navigationStrategy`, and availability metadata; populate all 34 leaves with the audited legacy mappings while retaining unique current keys in src/components/layout/menu-items.ts
- [x] T005 Implement the shared destination resolver for internal, configured external-replace, and unavailable outcomes without inferring behavior from menu keys in src/components/layout/menu-navigation.ts
- [x] T006 Implement a reusable, accessible Vietnamese unavailable-destination status using the existing shadcn `Button` composition in src/components/layout/sidebar-unavailable-status.tsx; document that no equivalent exists in reference-old/src/components/Menu.jsx because legacy registered every destination

**Checkpoint**: Expanded and collapsed navigation can consume the same typed menu and destination contract.

---

## Phase 3: User Story 1 - Nhận diện sidebar quen thuộc (Priority: P1) 🎯 MVP

**Goal**: Restore the legacy sidebar's measured dimensions, spacing, palette, scrolling, icon treatment, and synchronized content offset in both modes.

**Independent Test**: Render collapsed and expanded states at the same desktop viewport as `reference-old/src/components/Menu.jsx` and `Layout.jsx`; verify every measured region and confirm only the navigation area scrolls.

### Tests for User Story 1

- [x] T007 [P] [US1] Write failing component assertions for 48/238px widths, brand/profile/notification/menu/footer heights, divider geometry, icon weight, and expanded/collapsed styling in tests/components/app-sidebar-visual.test.tsx
- [x] T008 [P] [US1] Write failing shell assertions for 50/238px content offsets, 400ms synchronized transitions, background, height, and vertical-scroll ownership in tests/components/app-shell-layout.test.tsx
- [x] T009 [P] [US1] Add failing collapsed and expanded desktop screenshot assertions against the legacy reference measurements in tests/e2e/sidebar-navigation.spec.ts

### Implementation for User Story 1

- [x] T010 [US1] Match `reference-old/src/components/Menu.jsx` in src/components/layout/app-sidebar.tsx by correcting z-index, 400ms width transition, compact logo height, Lucide stroke weight, notification gap/hit areas/72px collapsed section, active collapsed icon color, mode-specific overflow, and 77px/top-only footer rhythm while retaining shadcn `Button` focus styling
- [x] T011 [P] [US1] Match `reference-old/src/components/Layout.jsx` in src/components/layout/app-shell.tsx by synchronizing the 400ms margin transition, restoring the 50px collapsed and 238px expanded offsets, and aligning desktop height/background/scroll ownership without changing public-route exclusion

**Checkpoint**: The shared shell is visually equivalent in both modes and can be demonstrated independently before navigation behavior changes.

---

## Phase 4: User Story 2 - Chọn menu trong sidebar mở rộng (Priority: P1)

**Goal**: Make direct items, group disclosures, nested destinations, route-active state, and unavailable destinations behave predictably in expanded mode.

**Independent Test**: In expanded mode, activate a direct destination, toggle a group, choose level-2 and level-3 destinations, then use direct URLs/back/forward; verify correct outcome, active state, ancestor expansion, and no 404.

### Tests for User Story 2

- [x] T012 [P] [US2] Write failing unit tests for exact/prefix path matching, active ancestor discovery, legacy default groups, and route-driven expansion that preserves unrelated manual state in tests/features/layout/menu-route-state.test.ts
- [x] T013 [P] [US2] Write failing component tests for expanded direct links, group-only toggles, nested activation, `aria-current`, unavailable feedback, and popup cleanup on route/logout/mode changes in tests/components/app-sidebar-expanded.test.tsx
- [x] T014 [US2] Extend tests/e2e/sidebar-navigation.spec.ts with failing expanded-mode journeys covering direct, second-level, third-level, detail-path, back/forward, `Bản đồ`, `Báo cáo`, and `Tuyến số` behavior

### Implementation for User Story 2

- [x] T015 [P] [US2] Implement reusable path matching, recursive active-ancestor discovery, default-state construction, and pathname state merging in src/components/layout/menu-route-state.ts
- [x] T016 [US2] Integrate the route-driven ancestor expansion from reference-old/src/components/Menu.jsx into src/components/layout/app-sidebar.tsx so active ancestors open after direct load and back/forward while unrelated group choices persist
- [x] T017 [US2] Match the observable leaf-selection outcomes from reference-old/src/components/Menu.jsx and App.jsx by routing expanded activation through src/components/layout/menu-navigation.ts from src/components/layout/app-sidebar.tsx, closing transient UI first, and rendering src/components/layout/sidebar-unavailable-status.tsx instead of broken links
- [x] T018 [US2] Retain the expanded visual active treatment from reference-old/src/components/Menu.jsx while adding `aria-current="page"`, stable disclosure ids, `aria-controls`, and active-ancestor semantics in src/components/layout/app-sidebar.tsx
- [x] T019 [P] [US2] Replace the generic dashboard copy with an explicit map-module migration/unavailable status in src/app/dashboard/page.tsx so it is not presented as equivalent to the `/map` function registered by reference-old/src/App.jsx
- [x] T020 [P] [US2] Replace the generic reports copy with an explicit statistic-module migration/unavailable status in src/app/reports/page.tsx so it is not presented as equivalent to the `/statistic` function registered by reference-old/src/App.jsx

**Checkpoint**: Expanded navigation is independently usable, route-aware, accessible, and never silently sends users to a missing or semantically wrong function.

---

## Phase 5: User Story 3 - Chọn menu nhiều cấp trong sidebar thu gọn (Priority: P1)

**Goal**: Replace the flattened popup with the legacy two-panel hierarchy while adding complete keyboard and popup lifecycle behavior.

**Independent Test**: In collapsed mode open System, open an intermediate group, test viewport edges, select a leaf, click outside, press Escape, and expand the sidebar; verify panel hierarchy, placement, closure, focus restoration, and activation.

### Tests for User Story 3

- [x] T021 [P] [US3] Write failing unit tests for root popup vertical constraints, dynamic max-height, nested right/left flipping, and viewport padding in tests/features/layout/sidebar-popup-position.test.ts
- [x] T022 [P] [US3] Write failing component tests for one root popup, clickable intermediate groups, separate level-3 portal, leaf closure, outside click, Escape depth, focus restoration, route change, logout, and mode change in tests/components/sidebar-popup.test.tsx
- [x] T023 [US3] Extend tests/e2e/sidebar-navigation.spec.ts with failing collapsed System journeys for cascading popup visuals, keyboard-only operation, viewport-edge placement, and unavailable destination feedback

### Implementation for User Story 3

- [x] T024 [P] [US3] Implement trigger- and viewport-based root/nested popup placement with resize/scroll recomputation in src/components/layout/sidebar-popup-position.ts
- [x] T025 [US3] Match the level-2 popup in reference-old/src/components/Menu.jsx by replacing the flat 210px popup in src/components/layout/app-sidebar.tsx with a 200px root popup using a divided 14px header, 14px gray active rows, semantic links/buttons, and placement from src/components/layout/sidebar-popup-position.ts
- [x] T026 [US3] Match the cascading level-3 layout in reference-old/src/components/Menu.jsx by implementing an accessible 180px side popup with a clickable intermediate disclosure button, chevron, independent portal, and horizontal fallback in src/components/layout/app-sidebar.tsx; document the custom composition because the current shadcn set has no nested viewport-aware navigation primitive
- [x] T027 [US3] Reproduce the popup lifecycle from reference-old/src/components/Menu.jsx and extend it accessibly by implementing one-root/one-nested state, trigger refs, deepest-first Escape, focus restoration, outside-target detection, and cleanup on pathname/logout/expand in src/components/layout/app-sidebar.tsx
- [x] T028 [US3] Preserve the popup appearance from reference-old/src/components/Menu.jsx while replacing incomplete `menu/menuitem` roles with navigation-disclosure `aria-haspopup`, `aria-expanded`, `aria-controls`, accessible names, and active-link semantics in src/components/layout/app-sidebar.tsx

**Checkpoint**: Collapsed navigation supports all three hierarchy levels with legacy visuals and stronger keyboard behavior.

---

## Phase 6: User Story 4 - Chỉ thấy các chức năng được phép sử dụng (Priority: P2)

**Goal**: Restore legacy permission-aware menu visibility consistently in both sidebar modes without granting access from malformed data.

**Independent Test**: Render empty, single-nested, malformed, and full permission sessions in both modes; verify the same permitted leaves and ancestor chains appear, empty groups disappear, and `Bản đồ` remains visible.

### Tests for User Story 4

- [x] T029 [P] [US4] Write failing tests for valid, duplicate, empty, and malformed `FunctionCode`/`PermissionsCode` normalization in tests/features/layout/menu-access.test.ts
- [x] T030 [P] [US4] Write failing recursive tree-filter tests for `all`, coded leaves, duplicate destinations, empty ancestors, stable order, and three-level branches in tests/features/layout/menu-visibility.test.ts
- [x] T031 [P] [US4] Write failing component tests proving expanded and collapsed modes expose identical permission-filtered destinations and render no empty group in tests/components/app-sidebar-permissions.test.tsx

### Implementation for User Story 4

- [x] T032 [P] [US4] Define the guarded normalized sidebar permission record without weakening the stored auth response boundary in src/features/auth/types.ts
- [x] T033 [US4] Implement defensive permission normalization, duplicate-code merging, `all` handling, and recursive stable tree filtering in src/components/layout/menu-access.ts
- [x] T034 [US4] Match the recursive permission visibility from reference-old/src/components/Menu.jsx by deriving one tree from `session.Data.permissions` and using it for expanded rows, collapsed icons, root popup, nested popup, defaults, and active-state calculations in src/components/layout/app-sidebar.tsx

**Checkpoint**: Permission behavior matches the legacy sidebar, including the intentional empty-permission result of showing only `Bản đồ`.

---

## Phase 7: Polish & Cross-Cutting Validation

**Purpose**: Prove the complete feature against the destination matrix, accessibility contract, visual reference, and repository quality gates.

- [x] T035 Extend tests/e2e/sidebar-navigation.spec.ts with the full 34-leaf destination matrix, permission variants, no-404 assertions, logout regression, and same-session collapsed preference checks
- [x] T036 Perform the four-way legacy/current visual comparison plus root/nested viewport-edge captures and record approved deviations/evidence in specs/004-sidebar-legacy-parity/quickstart.md
- [x] T037 Run `npm run type-check`, `npm run lint`, `npm test`, `npm run test:e2e -- --grep "sidebar"`, and `npm run build`; record any environment-only limitation and its reproduction command in specs/004-sidebar-legacy-parity/quickstart.md
- [x] T038 Review every finding A1-A10, B1-B12, and C1-C15 from specs/004-sidebar-legacy-parity/research.md against the final code, then update completion evidence and any explicitly deferred notification integration in specs/004-sidebar-legacy-parity/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 — Setup**: No dependencies; T001-T003 can run in parallel.
- **Phase 2 — Foundational**: Depends on Phase 1 and blocks all user stories; execute T004 → T005 → T006.
- **Phase 3 — US1**: Depends on Phase 2; visual tests precede T010/T011.
- **Phase 4 — US2**: Depends on Phase 2; T012/T013 precede implementation, T014 precedes the final E2E pass, and T015 precedes T016.
- **Phase 5 — US3**: Depends on Phase 2; T021/T022 precede implementation, T024 precedes T025/T026, and T025/T026 precede T027/T028.
- **Phase 6 — US4**: Depends on Phase 2; T029-T031 precede T032-T034, and T032/T033 precede T034.
- **Phase 7 — Polish**: Depends on all stories selected for release.

### User Story Dependency Graph

```text
Setup -> Foundation -> US1 (visual shell)
                    -> US2 (expanded navigation)
                    -> US3 (collapsed cascading popup)
                    -> US4 (permission visibility)

US1 + US2 + US3 + US4 -> Polish and full regression
```

The stories are behaviorally testable after Foundation without requiring another story. Because US1, US2, US3, and US4 all eventually touch `src/components/layout/app-sidebar.tsx`, the recommended single-developer order is US1 → US2 → US3 → US4; parallel teams must coordinate that shared file or integrate through short-lived branches.

### Parallel Opportunities

- T001, T002, and T003 are independent setup files.
- T007, T008, and T009 can be authored in parallel; after they fail, T010 and T011 modify different runtime files.
- T012 and T013 can be authored in parallel; T019 and T020 modify independent route pages.
- T021 and T022 can be authored in parallel; T024 can proceed independently before popup integration.
- T029, T030, T031, and T032 target separate files and can be prepared in parallel before permission integration.
- Different stories may proceed in parallel after Phase 2, subject to coordination around `app-sidebar.tsx` and `tests/e2e/sidebar-navigation.spec.ts`.

## Parallel Execution Examples

### User Story 1

```text
Task T007: Visual structure tests in tests/components/app-sidebar-visual.test.tsx
Task T008: Shell offset/scroll tests in tests/components/app-shell-layout.test.tsx
Task T009: Baseline E2E screenshots in tests/e2e/sidebar-navigation.spec.ts
```

### User Story 2

```text
Task T012: Route-state unit tests in tests/features/layout/menu-route-state.test.ts
Task T013: Expanded interaction tests in tests/components/app-sidebar-expanded.test.tsx
Task T019: Map placeholder status in src/app/dashboard/page.tsx
Task T020: Statistic placeholder status in src/app/reports/page.tsx
```

### User Story 3

```text
Task T021: Popup position tests in tests/features/layout/sidebar-popup-position.test.ts
Task T022: Popup behavior tests in tests/components/sidebar-popup.test.tsx
Task T024: Popup geometry utility in src/components/layout/sidebar-popup-position.ts
```

### User Story 4

```text
Task T029: Permission parser tests in tests/features/layout/menu-access.test.ts
Task T030: Tree filter tests in tests/features/layout/menu-visibility.test.ts
Task T031: Rendered visibility tests in tests/components/app-sidebar-permissions.test.tsx
Task T032: Normalized permission type in src/features/auth/types.ts
```

## Implementation Strategy

### MVP First — User Story 1

1. Complete Setup and Foundation.
2. Write and confirm failure of T007-T009.
3. Complete T010-T011.
4. Validate collapsed and expanded visual parity independently.
5. Stop for review if only the visual mismatch is needed immediately.

### Incremental Delivery

1. **US1** restores recognizable geometry and visual rhythm.
2. **US2** makes expanded navigation route-aware and prevents wrong/404 destinations.
3. **US3** restores the cascading collapsed workflow with keyboard support.
4. **US4** restores per-user visibility without changing route authorization policy.
5. **Polish** verifies the complete destination matrix and all audit findings.

### Verification Discipline

- Write each story's listed tests first and confirm failure for the intended missing behavior.
- Run focused tests after each task group, then the complete suite at the story checkpoint.
- Do not mark an unavailable module as migrated merely because a placeholder route exists.
- Do not introduce Flowbite, a Vite application path, a new UI dependency, or direct server fetching.
- Preserve semantic buttons, focus rings, and accessible state even where the legacy JSX lacks them.
