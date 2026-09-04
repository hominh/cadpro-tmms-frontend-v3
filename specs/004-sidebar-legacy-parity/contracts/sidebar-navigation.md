# UI Contract: Sidebar Navigation

## Rendering contract

1. The sidebar is rendered only in the authenticated application shell.
2. Collapsed width is 48px; expanded width is 238px.
3. The content offset is 50px collapsed and 238px expanded, matching the legacy shell's observed contract.
4. Width and offset transitions use the same 400ms timing.
5. Menu visibility is computed from one permission-filtered tree before either mode renders.

## Expanded-mode activation

| User activates | Required result |
|---|---|
| Direct top-level destination | Apply its navigation strategy; show active destination after successful navigation. |
| Top-level group | Toggle only that group; do not navigate. |
| Level-2 or level-3 destination | Apply navigation strategy; show active leaf and active ancestor treatment. |
| Browser back/forward or direct nested URL | Recompute active leaf and force its top-level ancestor open. |

Default expanded groups are Trace, Traffic Control, Bus Operation, Fleet Management, Statistics and System. Monitor is closed unless it contains the active route or the user opens it.

## Collapsed popup activation

| User activates | Required result |
|---|---|
| Group icon | Toggle one root popup anchored 4px after the rail. |
| Intermediate group row | Toggle one side popup; do not navigate. |
| Destination leaf | Close all popup layers, then apply destination strategy. |
| Different group icon | Replace the open root popup. |
| Outside target | Close all popup layers without navigation. |
| Expand sidebar | Close all popup layers before expanded navigation appears. |
| Escape | Close deepest layer first and restore focus to its trigger. |

Root popup visual contract: 200px minimum width, 14px divided header, 14px rows, legacy gray hover/active surface, viewport-constrained vertical placement. Nested popup: 180px minimum width, own header, opens on the available horizontal side and remains within the viewport.

## Destination contract

- `internal`: use normal Next navigation only when a corresponding page/adapter exists.
- `external-replace`: use only with an explicitly configured external/legacy target.
- `unavailable`: do not expose a broken href; announce a clear Vietnamese unavailable status.
- `Bản đồ` must represent legacy map functionality, not merely navigate to the generic dashboard placeholder.
- `Báo cáo` must represent legacy statistic functionality, not merely navigate to the generic reports placeholder.
- All active matching supports exact paths and nested detail paths.

## Permission contract

- `all` is visible to every authenticated user.
- A coded leaf is visible only when a valid matching permission record contains at least one permission code.
- Empty groups are removed recursively.
- Empty or malformed permission data grants no coded menu destinations; it does not fail open.
- Filtering changes visibility only; route-level authorization remains owned by the auth/access-control feature.

## Accessibility contract

- Destination links expose `aria-current="page"` when active.
- Group controls are semantic buttons with accessible names, `aria-expanded` and `aria-controls`.
- Popup triggers expose popup/disclosure intent without claiming an unimplemented ARIA menu model.
- Tab reaches each visible control in logical order; Enter/Space toggles group buttons.
- Escape and focus restoration follow the popup activation table.
- Visible focus styling is retained even where the visual reference did not provide it.

## Regression boundaries

- Logout continues clearing the current auth session and returning to login.
- Notification data, unread counters and notification selection are not implemented by this feature; their legacy layout dimensions are preserved.
- Unmigrated destination modules are not implemented by this feature.
- Existing unique menu keys remain stable; behavior is configured explicitly rather than inferred from legacy key names.
