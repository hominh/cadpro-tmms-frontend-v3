# Phase 0 Research: Sidebar Legacy Parity

## Audit scope

Compared directly:

- Current: `src/components/layout/app-sidebar.tsx`, `app-shell.tsx`, `menu-items.ts`, auth session types/storage, and current `src/app` routes.
- Legacy authority: `reference-old/src/components/Menu.jsx`, `Layout.jsx`, and route registration in `App.jsx`.

Line numbers below refer to the files as audited on 2026-09-04.

## Differences that require correction

### A. Menu data, permissions, and destinations

| # | Current code | Legacy code | Difference / failure | Planned correction |
|---|---|---|---|---|
| A1 | `menu-items.ts:14-20` | `Menu.jsx:27-305` | `MenuItem` has no permission/function code. | Add typed optional `permissionCode` to leaf metadata. |
| A2 | `app-sidebar.tsx:341-445` | `Menu.jsx:843-880,1053-1100,1181-1233` | Current renders all items unconditionally; legacy parses permissions, filters leaves recursively and hides empty groups. | Defensively normalize auth permissions and filter the menu tree once before both render modes. |
| A3 | `auth/types.ts:10` (`permissions: unknown[]`) | `Menu.jsx:843-860` | Permission record shape is not modeled or validated; current fixtures are empty. | Add a permission record guard for `FunctionCode` and array `PermissionsCode`; invalid records grant nothing. |
| A4 | `menu-items.ts:35-39`; current `/dashboard` page is generic welcome content | `Menu.jsx:29-33`; `App.jsx` maps `/map` to TrackingBus | `Bản đồ` points to a different function. | Preserve map semantics through an explicit destination mapping; do not claim `/dashboard` placeholder is equivalent to `/map`. |
| A5 | `menu-items.ts:95-100`; current `/reports` page is a generic placeholder | `Menu.jsx:157-165`; `App.jsx` maps `/statistic` to Statistic | `Báo cáo` points to a different function. | Preserve statistic/report semantics through explicit mapping; do not treat the placeholder as parity. |
| A6 | Current route tree contains only `/dashboard`, `/reports`, `/login` | `App.jsx:63-116` registers all legacy destinations | 32 menu leaf entries (31 unique current URLs) have no Next page and navigate to 404. | Do not create 31 business modules in this sidebar feature. Mark unavailable destinations clearly or disable their activation until a one-to-one route adapter exists. |
| A7 | `menu-items.ts:80`; all leaves use ordinary `Link` at `app-sidebar.tsx:171-184,222-232` | `Menu.jsx:420-429,930-937,970,986` | `Tuyến số` lost legacy full navigation to `/tmms/#/bus-route` plus reload. | Represent navigation strategy explicitly, not through key comparison. For the current Next deployment, prefer the real migrated route or unavailable state; only enable legacy external/full reload when deployment configuration confirms it is still required. |
| A8 | Most current keys use kebab-case and unique duplicate keys | Legacy uses snake_case/`*_item` and duplicates `electronic_item` | Internal keys differ; reverting them would reintroduce duplicate identity. The old special behavior depended on key text. | Keep stable unique current keys; introduce explicit metadata for permission, legacy identity and navigation behavior where needed. |
| A9 | Current omits child icons for `Chia sẻ dữ liệu` and `Lịch sử` | `Menu.jsx:168-179` stores `Share2` and `FolderSearch2` | Data differs, but legacy expanded/popup renderers do not display these child icons. | No visual fix required; document as non-observable legacy metadata unless a future renderer uses child icons. |
| A10 | No top-level badge model in menu/sidebar | `Menu.jsx:757-760,788-791,1191-1207,1218-1230` | Legacy can show a violations badge; current notification controls are inert and badge-free. | Record as notification integration outside this feature; preserve layout capacity and avoid blocking later badge restoration. |

The 31 unique current menu URLs with no corresponding `src/app/**/page.tsx` are:

`/image-monitor`, `/video-monitor`, `/violation`, `/nvaevents`, `/face-recognition`,
`/trafficnode`, `/greenwave`, `/stop-station`, `/infrastructure`, `/bus-route`,
`/electronic-board`, `/schedule`, `/vehicle`, `/drive`, `/datasharing`, `/history`,
`/devicetype`, `/device`, `/icon`, `/color`, `/transporttype`, `/vehicletype`,
`/management-route`, `/decentralization`, `/organization`, `/project-package`,
`/alert-type`, `/notification`, `/news`, `/feedback`, and `/whitelist`.

`/electronic-board` appears twice in the 34-leaf tree but is one unique URL. `/dashboard`
and `/reports` exist, but A4/A5 show why they are not established equivalents of the two
legacy functions they currently replace.

Permission mapping to restore exactly (including legacy codes whose names appear semantically reversed):

| Destination | Permission |
|---|---|
| Bản đồ | `all` |
| Giám sát hình ảnh / camera | `FUNC_GIAMSAT_HT` / `FUNC_GIAMSAT_CAMERA` |
| Tìm kiếm vi phạm | `FUNC_TEC_TIMKIEM_VP` |
| Truy vết đối tượng / Nhận diện khuôn mặt | `FUNC_TEC_TRUYVET` / `FUNC_NHANDIEN_KM` |
| Nút giao thông / Tuyến làn sóng xanh | `FUNC_LAN_SONG_XANH` / `FUNC_NUT_GIAO_THONG` |
| Trạm dừng / Hạ tầng / Tuyến số / Bảng điện tử / Lịch trình | `FUNC_TRAM_DUNG` / `FUNC_QL_HA_TANG` / `FUNC_TUYEN_XE` / `FUNC_CAU_HINH_BDT` / `FUNC_LICH_TRINH` |
| Đối tượng gán thiết bị / Lái xe | `FUNC_OBJECT` / `FUNC_LAIXE` |
| Báo cáo / Chia sẻ dữ liệu / Lịch sử | `FUNC_BAO_CAO` / `FUNC_CHIA_SE` / `FUNC_TMMS_LS` |
| Loại thiết bị / Thiết bị / Biểu tượng / Màu sắc | `FUNC_DEVICE_TYPE` / `FUNC_THIET_BI` / `FUNC_BIEU_TUONG` / `FUNC_MAU` |
| Loại hình vận tải / Loại phương tiện / Tuyến đường | `FUNC_LOAI_HINH_VAN_TAI` / `FUNC_LOAI_PHUONG_TIEN` / `FUNC_TUYEN_DUONG` |
| Người sử dụng / Tổ chức | `FUNC_NGUOI_SU_DUNG` / `FUNC_TO_CHUC` |
| Gói dự án / Loại cảnh báo | `FUNC_GOI_DUAN` / `FUNC_ALERT_TYPE` |
| Thông báo / Tin tức / Phản hồi | `FUNC_THONG_BAO` / `FUNC_BAIBAO` / `FUNC_PHAN_HOI` |
| Danh sách kiểm soát | `FUNC_DS_KIEM_SOAT` |

### B. Click behavior, popup lifecycle, route state, and accessibility

| # | Current code | Legacy code | Difference / failure | Planned correction |
|---|---|---|---|---|
| B1 | `app-sidebar.tsx:122-139` | `Menu.jsx:310-407` | Level-3 groups are flattened into a static 11px heading and inline links. Legacy uses a clickable level-2 row with chevron and a separate side popup. | Add semantic nested disclosure button and viewport-aware level-3 portal; leaf closes both layers. |
| B2 | `app-sidebar.tsx:245-247,400-418` | `Menu.jsx:910-928` | Defaults are initialized, but route changes never force the active parent open. Direct URL/back/forward can hide the active child. | On pathname change, open every active ancestor while preserving unrelated manual open/closed states. |
| B3 | `app-sidebar.tsx:264-279` | `Menu.jsx:889-903` | Current outside-click exclusion treats the entire sidebar as inside. Clicking unrelated sidebar controls leaves popup open. | Limit inside targets to active trigger and popup tree; close on unrelated sidebar actions. |
| B4 | `app-sidebar.tsx:376-388,448-473` | Popup exists only inside legacy collapsed render `Menu.jsx:1053-1081` | Direct leaf, logout and expand do not close popup; popup render is not conditional on `collapsed`, so it can remain over expanded UI. | Clear popup on pathname, direct destination, logout and expand; render it only while collapsed. |
| B5 | `app-sidebar.tsx:281-285` | `Menu.jsx:440-468` | Root popup position uses a fixed 280px height heuristic and is computed once. | Calculate from trigger and popup dimensions, constrain viewport, and recompute on relevant resize/scroll. |
| B6 | Current recursive prefix active match `app-sidebar.tsx:93-99,168` | Legacy root/expanded uses prefix `Menu.jsx:862-871`, but level-3 popup uses exact match at `340` | Popup highlighting differs for nested detail URLs. | Keep prefix matching consistently; it preserves active context for detail routes and is an approved accessibility/usability improvement. |
| B7 | Current group triggers are buttons `app-sidebar.tsx:360-374,392-417` | Legacy uses clickable divs in collapsed/nested popup `Menu.jsx:385-407,1064-1081` | Literal DOM behavior differs; copying legacy would regress keyboard use. | Keep semantic buttons and reproduce only appearance/observable disclosure behavior. |
| B8 | Popup uses `role=menu/menuitem` at `app-sidebar.tsx:118,173` but implements no ARIA menu keyboard model | Legacy has no ARIA menu model | Current semantics promise arrow-key behavior that does not exist. | Use ordinary navigation-disclosure semantics: links + buttons, stable ids, `aria-controls`, `aria-expanded`, and `aria-haspopup`; remove incomplete menu roles. |
| B9 | Active links only have visual classes `app-sidebar.tsx:175-181,224-229,378-383,423-428` | Legacy also visual-only | Neither exposes current page to assistive technology. | Add `aria-current="page"` to every active destination link. |
| B10 | Current closes only on `mousedown` `app-sidebar.tsx:264-279` | Legacy also closes only on pointer at `Menu.jsx:363-376,889-903` | No Escape behavior, initial focus policy, or trigger focus restoration. | Escape closes the deepest layer first and restores focus; focus must never become trapped or lost. |
| B11 | Collapsed state is controlled by `app-shell.tsx:26-42` | Legacy owns state at `Menu.jsx:765-768,813-820,905-908` | Architecture differs but session persistence and parent offset result are equivalent. | No correction; retain controlled state as a safer Next composition. |
| B12 | Every leaf uses generic Next link activation | Legacy has centralized special handling at `Menu.jsx:930-937` plus popup handling | Expanded/collapsed paths can diverge when special behavior is added. | Route all leaf activation through one reusable resolver/handler shared by direct, expanded and popup links. |

### C. Visual layout and styling

| # | Current code | Legacy code | Difference / failure | Planned correction |
|---|---|---|---|---|
| C1 | `app-sidebar.tsx:296-298`: `z-40`, 300ms, no `will-change` | `Menu.jsx:997-1004`: `z-[100]`, 400ms, `will-change-[width]` | Layering and animation timing differ. | Restore z-index 100, 400ms and width rendering hint. |
| C2 | `app-shell.tsx:58-60`: main 300ms, collapsed margin 48px | `Layout.jsx:37-40`: 400ms, `will-change`, collapsed margin 50px | Content movement is out of sync and offset by 2px. | Use legacy 400ms, rendering hint and 50px collapsed content margin; expanded stays 238px. |
| C3 | `app-shell.tsx:47,58`: `min-h-dvh`, forced `#f8fafc`, document-like vertical flow | `Layout.jsx:25-40`: desktop screen height, relative wrapper, main-owned vertical scroll | Background and scroll ownership differ. | Reproduce equivalent desktop height/scroll ownership; remove forced shell gray where it changes legacy pages. |
| C4 | `app-sidebar.tsx:326`: notification gap 2px | `Menu.jsx:1165`: 4px | Expanded bells are too close. | Change to 4px. |
| C5 | `app-sidebar.tsx:490-500`: expanded bell 28×28, rounded 4px | `Menu.jsx:687-693`: expanded bell 32×32, circular | Hit area and hover shape differ. | Use 32×32 circular expanded bell. |
| C6 | `app-sidebar.tsx:334-338,493-495`: collapsed section has 8px total padding; hover fills a 36px-wide row | `Menu.jsx:1033-1052,687-693`: two exact 36px rows with centered 28×28 circular buttons, no section padding | Current section is about 80px instead of 72px and hover geometry differs. | Render two 36px rows and 28×28 circles; remove section vertical padding. |
| C7 | `app-sidebar.tsx:116-121`: popup 210px, custom shadow, header 12px/no divider | `Menu.jsx:436-478`: popup 200px, legacy border/shadow, 14px header with divider | Popup width, typography and separator differ. | Match 200px root popup and legacy header/border/shadow. |
| C8 | `app-sidebar.tsx:176-180`: popup rows 12px, blue active style | `Menu.jsx:359-419`: 14px rows, gray active/hover style | Popup density and active language differ. | Match 14px rows and gray legacy active surface while retaining visible focus ring. |
| C9 | `app-sidebar.tsx:123-138` | `Menu.jsx:310-407` | Inline flattened third level changes both layout and hierarchy. | Use 180px minimum side popup with its own header and rows, including side flipping. |
| C10 | `app-sidebar.tsx:363-387`: active collapsed icon becomes blue | `Menu.jsx:1067-1097`: only border/background changes | Icon color differs. | Remove active blue text override in collapsed rows. |
| C11 | `app-sidebar.tsx:448-474`: footer has 9px padding top and bottom, no fixed collapsed height | `Menu.jsx:1112-1129,1249-1266`: collapsed footer is 77px with top padding only; expanded uses top padding only | Current footer consumes different height and reduces nav space. | Use top padding only; set collapsed footer to 77px. |
| C12 | `app-sidebar.tsx:452-465`: Button defaults plus generic `px-1`/alignment | `Menu.jsx:1112-1129,1252-1260`: explicit centered collapsed and `gap-2 pl-1` expanded | Inherited Button styles can alter spacing. | Explicitly encode legacy alignment/gap/padding and neutralize irrelevant Button defaults. |
| C13 | `app-sidebar.tsx:341`: same overflow classes in both modes | `Menu.jsx:1053,1181`: mode-specific overflow | Expanded focus/visual overflow is always clipped currently. | Use mode-specific classes unless tests confirm no visible/accessibility difference. |
| C14 | `BrandMark` compact SVG at `app-sidebar.tsx:53` is 18×19 | `Menu.jsx:1009-1026` compact SVG is 18×22 | Compact logo is 3px too short. | Use 18×22. |
| C15 | Current top-level/menu icons specify `strokeWidth=1.8` at `app-sidebar.tsx:373,387,408,430` | Legacy uses Lucide default stroke width at `Menu.jsx:1069,1097,1200,1225` | Icons render visibly thinner. | Use the legacy/default stroke weight unless a visual snapshot proves equivalence. |

Already matching and not to be rewritten: sidebar widths 48/238px; 44px brand row; 48px profile row and 28px avatar; expanded first-level 30px rows; 24px child rows and 38px indentation; divider placement and 22px collapsed divider width.

## Research decisions

### Decision 1: Preserve observable behavior, not obsolete router implementation

**Decision**: Next-native navigation remains the default. Legacy hash/full-reload behavior becomes explicit optional metadata and is enabled only for a deployment target that still requires it. Missing modules produce a deliberate unavailable state rather than 404.

**Rationale**: The legacy `/tmms/#/bus-route` sequence is a router/deployment workaround, while the user requirement is reaching the correct function. Blindly copying it would violate the Next architecture and currently targets a route that does not exist in this repository.

**Alternatives considered**: Copy the timeout/reload exactly (rejected as legacy infrastructure coupling); create all missing modules now (rejected as major scope expansion); keep broken links (rejected by spec).

### Decision 2: Keep current unique keys and add explicit metadata

**Decision**: Do not revert kebab-case keys. Add permission and navigation fields so behavior does not depend on key spelling.

**Rationale**: Legacy contains duplicate `electronic_item` keys. Stable unique identity is needed for disclosure state, React rendering and testing.

**Alternatives considered**: Reuse legacy keys verbatim (rejected due duplicate identity); infer permission/action from label or path (rejected as fragile).

### Decision 3: Use recursive permission filtering from the auth snapshot

**Decision**: Parse only valid permission records, regard a non-empty permission-code array as access, always allow `all`, and remove empty ancestors.

**Rationale**: This exactly reproduces legacy visibility while handling the current `unknown[]` boundary safely. An empty permission list intentionally leaves only `Bản đồ` visible.

**Alternatives considered**: Render all menu items (current bug); hide only leaves but keep empty groups (confusing); add a server request (not needed and outside scope).

### Decision 4: Model collapsed navigation as accessible disclosures

**Decision**: Use semantic buttons and links, not a full ARIA application-menu pattern. Add Escape, focus restoration, ids/controls and `aria-current`.

**Rationale**: The UI is site navigation, not an application command menu. This keeps ordinary browser/link keyboard behavior and satisfies the constitution without copying legacy clickable divs.

**Alternatives considered**: Full roving-tabindex menu semantics (unnecessary complexity); literal non-focusable legacy DOM (accessibility regression); keep mismatched roles (invalid/incomplete contract).

### Decision 5: Route controls disclosure state

**Decision**: On each pathname change, force open active ancestors and retain manual states for unrelated groups. Popup state closes on navigation or mode change.

**Rationale**: Matches legacy behavior and guarantees current location remains discoverable after direct load, back and forward navigation.

**Alternatives considered**: Reset all groups to defaults on every route (destroys user choices); never alter user state (can hide active item).

### Decision 6: Restore exact legacy visual tokens with narrow accessibility exceptions

**Decision**: Correct all measured dimensions/timing/colors listed above. Retain focus rings and semantic controls even where the reference lacks them.

**Rationale**: Visual fidelity is constitutional, while keyboard accessibility is also mandatory. Focus styling is visible only during keyboard interaction and does not change the baseline design.

**Alternatives considered**: Pixel-copy the inaccessible reference; retain current approximations; introduce a redesign. All conflict with one or both governing principles.
