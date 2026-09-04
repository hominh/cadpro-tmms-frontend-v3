# Feature Specification: Common Application Layout Migration

**Feature Branch**: `ui/migrate-layout`

**Created**: 2026-08-14

**Status**: Implemented (Retrospective)

**Input**: User description: "Layout chung (layout/menu) đã được migrate từ dự án cũ
sang Next.js + shadcn, giữ nguyên bố cục và hành vi gốc. Ghi lại spec cho việc đã làm."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Use the Common Application Shell (Priority: P1)

As an authenticated user, I want every protected application page to appear beside the
same navigation sidebar so that I can move between modules without relearning the page
structure.

**Why this priority**: The shared shell is the foundation for every migrated module and
must remain visually familiar to existing users.

**Independent Test**: Open two protected pages and confirm that both retain the same
sidebar structure, content offset, branding, user area, and navigation placement while
the page-specific content changes.

**Acceptance Scenarios**:

1. **Given** an authenticated user opens a protected page, **When** the page is displayed,
   **Then** the common sidebar, branding, user summary, notifications area, navigation,
   and footer controls are visible in the same relative positions as the legacy layout.
2. **Given** the user navigates between protected pages, **When** the destination content
   loads, **Then** the common shell remains stable and only the page content changes.
3. **Given** an unauthenticated user opens the login page, **When** the page is displayed,
   **Then** the common authenticated shell is not shown.

---

### User Story 2 - Collapse and Expand Navigation (Priority: P1)

As a user, I want to collapse the sidebar to an icon rail and expand it again so that I
can choose between more workspace and more navigation context.

**Why this priority**: Collapse behavior is a defining interaction of the legacy layout
and directly affects the usable content area.

**Independent Test**: Toggle the sidebar in both directions, reload or revisit a protected
page in the same browser session, and verify the sidebar and content area retain the
selected state.

**Acceptance Scenarios**:

1. **Given** the sidebar is expanded, **When** the user selects the collapse control,
   **Then** it becomes an icon-only rail and the main content expands into the released
   space without overlap.
2. **Given** the sidebar is collapsed, **When** the user selects the expand control,
   **Then** labels, user details, and expanded navigation become visible and the main
   content shifts accordingly.
3. **Given** the user selected a sidebar state, **When** they navigate within the same
   browser session, **Then** the selected state is preserved.

---

### User Story 3 - Navigate Hierarchical Modules (Priority: P1)

As a user, I want access to the same module groups and hierarchy as the legacy system so
that existing navigation habits and terminology continue to work.

**Why this priority**: A visually accurate shell is not useful if users cannot find the
same operational areas or understand their current location.

**Independent Test**: Exercise a direct menu item, a second-level item, and a third-level
item in both expanded and collapsed sidebar modes; verify navigation and active-state
feedback for each.

**Acceptance Scenarios**:

1. **Given** the sidebar is expanded, **When** the user opens or closes a menu group,
   **Then** its children appear or disappear without changing unrelated groups.
2. **Given** the sidebar is collapsed, **When** the user selects a grouped icon, **Then**
   a readable flyout presents its nested destinations without being clipped by the
   sidebar.
3. **Given** the current page belongs to a menu destination, **When** the navigation is
   displayed, **Then** the destination and its containing group communicate the active
   location.
4. **Given** a divider separates major menu areas in the legacy navigation, **When** the
   migrated navigation is displayed, **Then** the same grouping boundary remains visible.

---

### User Story 4 - Use Account and Accessible Controls (Priority: P2)

As an authenticated user, I want recognizable account, notification, and logout controls
that work with pointer or keyboard input so that the shared shell remains usable and
accessible.

**Why this priority**: These controls complete the common application frame and provide
the expected exit path without taking priority over core module navigation.

**Independent Test**: Navigate through all sidebar controls using only the keyboard,
activate logout, and verify visible focus, accessible labels, and return to the public
login experience.

**Acceptance Scenarios**:

1. **Given** authenticated user information is available, **When** the sidebar is
   expanded, **Then** the user's initials, display name, and role are presented in the
   user area without overflowing the sidebar.
2. **Given** the sidebar is collapsed, **When** a control has no visible text label,
   **Then** it still exposes an accessible name and a pointer hint.
3. **Given** the user activates logout, **When** logout completes, **Then** the
   authenticated session is cleared and the user returns to the login page.
4. **Given** a keyboard-only user moves through the sidebar, **When** focus reaches an
   interactive item, **Then** a visible focus indicator identifies the active control.

### Edge Cases

- The current route is a nested path beneath a configured menu destination; the parent
  destination still receives active-state treatment.
- A menu group contains a third navigation level; its heading and destinations remain
  readable in both expanded navigation and collapsed flyout modes.
- The user has a long display name or role; the user area truncates text without changing
  the sidebar width or hiding account controls.
- User information is incomplete; the shell provides stable fallback initials, name, and
  role without leaving an empty or broken header.
- The sidebar contains more items than fit vertically; navigation scrolls independently
  while branding and footer controls remain available.
- A collapsed flyout is opened near the bottom of the viewport; it remains within the
  visible area and permits scrolling when necessary.
- The user clicks outside an open collapsed flyout; the flyout closes without navigating.
- The stored sidebar preference is missing or invalid; the sidebar starts in the legacy
  default collapsed state.
- The current page has no corresponding menu item; the page remains usable and no
  unrelated destination is marked active.
- A destination module has not yet been migrated; the common menu may expose its reserved
  destination, while that module's page content remains outside this feature's scope.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display the common application shell on every authenticated
  application page and MUST exclude it from the public login page.
- **FR-002**: The common shell MUST contain branding, a user summary, notification access,
  hierarchical navigation, logout, and a sidebar collapse control in the same structural
  order as the legacy shell.
- **FR-003**: The sidebar MUST support a collapsed icon-only state and an expanded labeled
  state.
- **FR-004**: The collapsed sidebar MUST occupy 48 pixels of horizontal space, and the
  expanded sidebar MUST occupy 238 pixels, matching the legacy layout dimensions.
- **FR-005**: The page content region MUST shift to remain adjacent to the current sidebar
  width and MUST NOT be hidden beneath the sidebar.
- **FR-006**: The system MUST preserve the user's collapsed or expanded preference while
  the current browser session remains active.
- **FR-007**: Expanded navigation groups MUST allow users to reveal and hide their child
  destinations independently.
- **FR-008**: Collapsed navigation groups MUST expose their child destinations through a
  flyout positioned beside the icon rail.
- **FR-009**: The flyout MUST support second- and third-level navigation, remain within the
  visible viewport, and close after destination selection or an outside interaction.
- **FR-010**: Navigation MUST preserve the legacy top-level labels, logical group order,
  child hierarchy, icons, and divider placement recorded in the source reference.
- **FR-011**: The system MUST mark the current destination as active and MUST communicate
  active state for a parent group containing that destination.
- **FR-012**: The user area MUST display available user identity and role information and
  MUST provide stable fallback values when that information is incomplete.
- **FR-013**: Activating logout MUST clear the authenticated session and return the user
  to the login page.
- **FR-014**: All navigation and account controls MUST be keyboard operable, expose
  accessible names, and display a visible focus state.
- **FR-015**: Sidebar and content-width changes MUST animate without preventing the user
  from interacting with the resulting layout.
- **FR-016**: Navigation overflow MUST scroll independently so that branding, user
  context, and footer controls retain their intended positions.
- **FR-017**: Live notification feeds, notification counters, per-function permission
  filtering, and destination module content are outside this common-layout feature and
  MUST be specified separately before those behaviors are added.

### UI Fidelity Requirements

- **UIR-001**: The authoritative legacy references are
  `reference-old/src/App.jsx`, `reference-old/src/components/Layout.jsx`, and
  `reference-old/src/components/Menu.jsx`.
- **UIR-002**: The migrated shell MUST preserve the legacy sidebar dimensions, fixed-left
  placement, content offset, header and footer ordering, compact row heights, divider
  positions, white and light-gray surfaces, dark-blue branding, and blue active states.
- **UIR-003**: Expanded mode MUST preserve visible TMMS branding, the user identity block,
  inline notification controls, labeled menu rows, nested menu indentation, and labeled
  logout and collapse controls.
- **UIR-004**: Collapsed mode MUST preserve the compact brand mark, avatar, vertically
  stacked notification controls, centered navigation icons, compact dividers, and
  icon-only footer controls.
- **UIR-005**: This migration MUST reproduce the existing visual language rather than
  introduce a redesigned shell; any intentional visual deviation requires a separately
  documented product rationale.

### Key Entities

- **Application Shell**: The persistent authenticated frame that positions the sidebar
  beside page-specific content.
- **Navigation Item**: A labeled destination or grouping node with an icon, hierarchy,
  active state, and optional children.
- **Sidebar Preference**: The collapsed or expanded choice retained for the current
  browser session.
- **User Summary**: The initials, display name, and role shown in the sidebar header.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of authenticated pages tested display the common shell, while 100% of
  public login-page tests display without it.
- **SC-002**: Visual comparison confirms all legacy top-level menu groups, labels,
  hierarchy levels, and divider boundaries are represented in the migrated navigation.
- **SC-003**: In 100% of collapse and expand checks, the sidebar reaches the expected
  width and the content region remains visible without overlap.
- **SC-004**: In 100% of same-session navigation checks, the user's selected sidebar state
  remains unchanged until they choose a different state.
- **SC-005**: Users can reach a direct, second-level, and third-level destination in both
  sidebar modes using no more interactions than the equivalent legacy navigation flow.
- **SC-006**: 100% of tested configured routes display the correct active navigation
  feedback, including nested routes.
- **SC-007**: Keyboard-only users can reach, identify, and activate every visible sidebar
  control, including logout, without pointer input.
- **SC-008**: Visual review at the project's supported desktop viewport confirms no
  unapproved differences in sidebar placement, dimensions, structural order, core color
  treatment, or menu behavior compared with the three legacy references.

## Assumptions

- The three files named in UI Fidelity Requirements are the authoritative reference for
  common-shell structure and navigation behavior.
- The feature records the already completed common-layout migration and does not require
  a new visual direction.
- The existing authentication flow supplies the user context and owns route protection;
  this feature only presents that context and provides the expected logout entry point.
- The navigation retains reserved destinations for modules that will be migrated under
  separate feature specifications.
- Notification placement belongs to this shell, while live alerts, unread counts, and
  notification selection flows remain separate integration work.
- Per-function permission filtering remains separate integration work because its policy
  and data contract are not part of the common-layout migration described here.
- Desktop layout parity is the primary target inherited from the legacy interface;
  destination-specific responsive behavior remains owned by each migrated module.
