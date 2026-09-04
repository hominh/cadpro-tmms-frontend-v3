# Data Model: Sidebar Legacy Parity

## NavigationItem

Represents one stable node in the sidebar tree.

| Field | Type | Required | Rules |
|---|---|---:|---|
| `key` | string | yes | Unique across the complete tree; must not be used to infer behavior. |
| `label` | string | yes | Vietnamese legacy label, unchanged unless product explicitly approves a rename. |
| `icon` | icon reference | top-level only | Matches the legacy top-level icon. |
| `path` | string | leaf only | Canonical current destination used for active matching. |
| `legacyPath` | string | when path differs | Documents one-to-one functional mapping to the legacy destination. |
| `permissionCode` | string or `all` | leaf only | Exact legacy function code; `all` is visible to any authenticated user. |
| `navigationStrategy` | `internal`, `external-replace`, or `unavailable` | leaf only | Explicitly controls activation; never inferred from key text. |
| `children` | NavigationItem[] | group only | Non-empty in the configured source; maximum supported depth is three. |

Validation rules:

- A node is either a group (`children`) or destination (`path`), not both.
- Every destination has a permission code and navigation strategy.
- Duplicate paths are allowed only where the same function intentionally appears in multiple groups, such as `Cấu hình bảng điện tử`.
- Keys remain unique even when labels, paths or legacy identities repeat.
- `external-replace` requires an explicit target owned by deployment configuration.
- `unavailable` must have a user-facing reason and must not create a navigable link to a missing route.

## PermissionRecord

Normalized view of one raw auth permission entry.

| Field | Type | Rules |
|---|---|---|
| `functionCode` | string | Derived only from a non-empty `FunctionCode`. |
| `permissionCodes` | string[] | Derived only from an array; access exists when length is greater than zero. |

Malformed or duplicate raw records are handled defensively: malformed entries grant nothing; valid duplicate function codes are merged without weakening access.

## VisibleNavigationTree

A derived tree, not persisted.

- A destination is included when `permissionCode` is `all` or its normalized permission record has at least one permission code.
- A group is included when at least one descendant remains visible.
- Original order and depth are preserved.
- The same derived tree feeds expanded and collapsed renderers so visibility cannot diverge.

## DestinationMapping

Describes the functional relationship between a menu label, legacy destination, current destination and availability.

| State | Meaning | User-visible activation |
|---|---|---|
| `available-internal` | Corresponding Next destination exists. | Normal client navigation. |
| `available-external` | Function is intentionally served by a configured legacy/external target. | Replace navigation with clear full-page transition. |
| `unavailable` | Corresponding module has not been migrated/configured. | Non-link control or guarded activation with a clear unavailable message; never 404. |

Required special reviews:

- `Bản đồ`: legacy `/map`; current `/dashboard` is not functionally equivalent based on inspected content.
- `Báo cáo`: legacy `/statistic`; current `/reports` is not functionally equivalent based on inspected content.
- `Tuyến số`: legacy included a `/tmms/#/bus-route` replace plus reload workaround; current deployment must explicitly opt in before using `available-external`.

## ExpandedGroupState

Map from top-level group key to boolean.

Initial open keys: `trace`, `traffic-control`, `bus-operation`, `fleet-management`, `statistics`, `system`. `monitor` starts closed.

State transitions:

```text
initial load -> legacy defaults -> force active ancestors open
group activation -> toggle that group only
pathname change -> preserve unrelated groups + force new active ancestors open
```

## PopupState

Ephemeral state for collapsed navigation.

| Field | Meaning |
|---|---|
| `rootKey` | Open top-level group or null. |
| `nestedKey` | Open intermediate group within the root or null. |
| `rootTrigger` | Focus/position anchor for root popup. |
| `nestedTrigger` | Focus/position anchor for level-3 popup. |
| `rootPosition` | Viewport-constrained top/left/max-height. |
| `nestedPosition` | Viewport-constrained top/left with right-to-left fallback. |

State transitions:

```text
collapsed group activate -> root open
same root activate -> all popups closed
different root activate -> old tree closed, new root open
intermediate group activate -> nested popup toggled
leaf activate -> all popups closed, then destination strategy applied
Escape -> deepest popup closes and focus returns to its trigger
outside interaction / pathname change / expand / logout -> all popups closed
```

## SidebarPreference

Session-scoped boolean stored under the existing `sidebar_collapsed` key. Missing or invalid values resolve to `true` (collapsed). The controlled state in `app-shell.tsx` remains authoritative so sidebar width and content offset update together.
