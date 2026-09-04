# Quickstart: Validate Sidebar Legacy Parity

## Prerequisites

- Node dependencies installed.
- A valid local auth fixture containing representative roles and permissions.
- Desktop Chromium available for Playwright.
- Legacy reference files remain at `reference-old/src/components/Menu.jsx`, `Layout.jsx`, and `App.jsx`.

## Static checks

```powershell
npm run type-check
npm run lint
npm test
```

Expected: all commands exit successfully; permission parsing, tree filtering, route-active state and popup state tests pass.

## Start the application

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3000
```

In another terminal:

```powershell
npm run test:e2e -- --grep "sidebar"
```

## Required validation scenarios

### 1. Visual baseline

At the same desktop viewport, capture current and legacy sidebar in collapsed and expanded modes. Verify the measured items from [research.md](./research.md), especially:

- 48/238px sidebar widths and 50/238px content offsets;
- 44px brand, 48px profile, two 36px collapsed notification rows;
- 34px collapsed menu rows, 30px expanded parent rows, 24px child rows;
- 77px collapsed footer;
- notification button sizes/gap, popup widths/type, active colors and icon stroke.

Expected: no unapproved difference; keyboard focus ring is an intentional accessibility addition.

### 2. Route-driven expansion

1. Open an expanded sidebar and manually close Monitor.
2. Navigate directly to `/image-monitor` or simulate that pathname in the component test.
3. Exercise browser back and forward across destinations in different groups.

Expected: the active ancestor always opens; unrelated group choices are preserved; leaf and ancestor states remain correct for detail subpaths.

### 3. Collapsed cascading popup

1. Collapse the sidebar and activate System.
2. Activate Device Management.
3. Confirm a separate side popup appears; repeat near right and bottom viewport edges.
4. Select a permitted leaf, then repeat with outside click, Escape and sidebar expansion.

Expected: only one root/nested branch is open, panels remain in viewport, leaf selection closes all layers, Escape closes deepest first and restores focus.

### 4. Permission matrix

Validate three fixtures:

- Empty permissions: only `Bản đồ` remains.
- One nested permission: only its ancestor chain plus `Bản đồ` remains.
- Full representative permissions: all expected legacy destinations remain in original order.

Expected: expanded and collapsed modes expose the same destinations; no empty group is rendered; malformed records never grant access.

### 5. Destination matrix

Walk every one of the 34 leaf entries defined in [sidebar-navigation.md](./contracts/sidebar-navigation.md).

Expected: each opens its confirmed equivalent function or presents the explicit unavailable state. No activation reaches Next 404. Specifically verify `Bản đồ`, `Báo cáo`, and `Tuyến số` against their recorded legacy behavior.

### 6. Keyboard and screen-reader semantics

Use Tab, Shift+Tab, Enter, Space and Escape without pointer input.

Expected: all visible destinations and disclosures are reachable; group state is announced; current link exposes `aria-current`; focus is visible and returns to the correct trigger after popup closure.

## Completion evidence

Attach or record:

- command output for type-check, lint, unit/component and sidebar E2E suites;
- four baseline screenshots (legacy/current × collapsed/expanded) at the same viewport;
- popup edge screenshots for root and nested panels;
- tested permission fixtures and destination matrix results;
- any approved visual or navigation deviation with product rationale.

## Validation record — 2026-09-04

### Automated gates

| Gate | Result |
|---|---|
| `npm run type-check` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 19 files, 98 tests |
| `npm run test:e2e -- --grep sidebar` | PASS — 10/10 Chromium journeys |
| `npm run build` | PASS — production compilation, type validation, static generation and trace collection completed |

The first E2E/build attempt reused a stale Next development server on port 3000. Its
development-tools badge intercepted the bottom-left footer button and its open
`.next-cache/trace` handle caused `EPERM`. Stopping that workspace dev process and
rerunning produced the passing results above. Footer activation in E2E intentionally
uses keyboard Enter so the test also verifies keyboard operation and is independent of
the Next development badge.

### Legacy/current visual comparison

`reference-old` contains source only, without a runnable package or screenshot baseline.
The comparison therefore used the measured JSX/Tailwind contracts in legacy
`Menu.jsx`/`Layout.jsx`, current computed CSS in Chromium, and component structure
assertions instead of claiming unavailable legacy raster captures.

| View | Legacy source measurement | Current evidence | Result |
|---|---|---|---|
| Collapsed | 48px rail, 50px content offset, 44px brand, 48px profile, 72px notification block, 77px footer | E2E computed CSS plus `app-sidebar-visual.test.tsx` and `app-shell-layout.test.tsx` | PASS |
| Expanded | 238px rail/offset, 30px parent rows, 24px leaf rows, default Lucide stroke | E2E computed CSS and component assertions | PASS |
| Root popup | 200px minimum width, divided 14px header/rows, gray hover/active surface | Chromium E2E and popup unit/component tests | PASS |
| Nested popup | 180px minimum width, separate side panel, viewport fallback | 640×480 Chromium bounding-box assertions and geometry unit tests | PASS |

Approved differences are accessibility improvements: visible focus rings, semantic
buttons, `aria-current`, disclosure ids/state, deepest-first Escape handling and focus
restoration. Prefix matching is intentionally consistent for detail URLs. The popup is
a custom shadcn-compatible composition because the installed component set has no
nested viewport-aware navigation primitive.

### Audit disposition

| Findings | Final disposition |
|---|---|
| A1–A3 | Typed leaf permission metadata, guarded normalized record, defensive duplicate merge and fail-closed recursive filtering implemented. |
| A4–A5 | `/dashboard` and `/reports` are explicit migration-status adapters for legacy `/map` and `/statistic`; neither page claims functional equivalence. |
| A6–A8 | All 34 leaves retain stable unique keys and explicit strategy/legacy metadata; absent modules render unavailable controls, while configured bus-route deployment uses external replace. |
| A9 | No runtime change: child icons were non-observable in the legacy renderers. |
| A10 | Deferred to notification integration: layout capacity is preserved, but unread data/badges are outside this feature. |
| B1–B5 | Cascading two-panel popup, route/default state merge, unrelated-target close behavior, full lifecycle cleanup and responsive placement implemented. |
| B6–B10 | Recursive prefix matching, semantic disclosures, valid navigation semantics, `aria-current`, Escape depth and focus restoration implemented. |
| B11 | Controlled shell state retained; session preference and synchronized offset verified by E2E. |
| B12 | Every leaf renderer uses the shared destination resolver. |
| C1–C6 | Layering/timing/offset/scroll ownership and notification geometry match the recorded legacy values. |
| C7–C9 | Root and nested popup width, typography, hierarchy, gray states and side fallback restored. |
| C10–C15 | Collapsed active icon color, footer rhythm, explicit button spacing, overflow mode, compact logo and default icon stroke corrected. |

Permission coverage includes empty, malformed, limited nested and full 34-leaf
fixtures. The destination matrix proves that the only generated internal hrefs are
`/dashboard` and `/reports`; every other unconfigured destination is a guarded button,
so sidebar activation cannot reach a missing Next route.
