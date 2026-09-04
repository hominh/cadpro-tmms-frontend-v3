# Feature Specification: User Login

**Feature Branch**: `002-user-login`

**Created**: 2026-07-28

**Status**: Draft

**Input**: User description: "Xây dựng chức năng đăng nhập cho hệ thống. Người dùng nhập
email/username và mật khẩu để đăng nhập. Sau khi đăng nhập thành công, lưu token và
chuyển hướng vào trang chính. Nếu sai thông tin, hiển thị lỗi rõ ràng. Có xử lý trạng
thái loading khi đang gọi API."

**Amendment (2026-08-14)**: The backend response contract is case-sensitive. Its
top-level fields are `Status`, `Message`, and `Data`; successful session fields are nested
inside `Data` and retain their backend names, including `user_id`, `user_name`,
`ToChuc_Id`, `access_token`, `refresh_token`, `roles`, `permissions`, and `exp_refresh`.
Lowercase top-level aliases such as `status`, `message`, and `data` are not part of the
contract.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in Successfully (Priority: P1)

As a registered user, I want to sign in with my email or username and password so that I
can access the system's main page.

**Why this priority**: Successful authentication is the essential value of the feature
and the entry point for all authenticated system capabilities.

**Independent Test**: Submit valid credentials for an active account and confirm that the
session token is persisted securely and the user arrives at the main page.

**Acceptance Scenarios**:

1. **Given** the user is on the login page with valid credentials, **When** they submit
   the form, **Then** the system authenticates them, persists the returned JWT token,
   refresh token, and user information in localStorage, and redirects them to the main
   page.
2. **Given** the user has successfully signed in, **When** they open an authenticated
   page, **Then** the JWT token is available for authenticated requests and the persisted
   user information is available to render the authenticated context.
3. **Given** the authentication service returns a JWT token, refresh token, and user
   information, **When** the login response is processed, **Then** the system stores each
   value in one namespaced authentication record without storing the password.

### User Story 2 - Handle Invalid Credentials (Priority: P1)

As a user who entered incorrect credentials, I want a clear error message so that I know
the sign-in failed and can correct my input.

**Why this priority**: Clear failure feedback prevents confusion and is required for a
usable authentication flow.

**Independent Test**: Submit an incorrect email/username or password and confirm that a
clear error is shown, the user remains on the login page, and no authenticated session is
created.

**Acceptance Scenarios**:

1. **Given** the user submits invalid credentials, **When** the authentication service
   rejects the request, **Then** the login page shows a clear error message and keeps the
   entered identifier available for correction.
2. **Given** authentication fails, **When** the user views the login state, **Then** no
   new token is persisted and the user is not redirected to the main page.
3. **Given** the authentication service is unavailable, **When** the user submits valid-
   looking credentials, **Then** the system shows a recoverable service error without
   implying that the credentials are invalid.

### User Story 3 - Understand Form and Loading State (Priority: P2)

As a user signing in, I want immediate feedback while the request is processing and clear
validation for missing input so that I understand what action is available.

**Why this priority**: Preventing duplicate submissions and explaining invalid form state
improves reliability and reduces avoidable authentication failures.

**Independent Test**: Submit the form with missing fields and with a delayed authentication
response; verify validation and loading behavior independently.

**Acceptance Scenarios**:

1. **Given** the identifier or password is empty, **When** the user submits the form,
   **Then** the form shows a field-specific validation message and does not call the
   authentication service.
2. **Given** an authentication request is in progress, **When** the user views the form,
   **Then** the submit control indicates loading and prevents duplicate submissions.
3. **Given** the authentication request completes, **When** the result is success or
   failure, **Then** the loading state ends and the corresponding outcome is visible.

### User Story 4 - Protect Authenticated Routes (Priority: P1)

As an anonymous user, I want protected routes to redirect me to login so that I cannot
access authenticated content without a valid session.

As an authenticated user, I want `/` and `/login` to redirect to `/dashboard` so that I
enter the application directly instead of seeing the login screen again.

**Why this priority**: Route protection is part of the authentication boundary. Without
it, successful login does not reliably protect application content or provide a
consistent entry point.

**Independent Test**: Visit a protected route with and without the expected local session,
then visit `/` and `/login` with an existing session; verify each redirect destination
and that no redirect loop occurs.

**Acceptance Scenarios**:

1. **Given** there is no valid authenticated session, **When** the user visits any
   protected route, **Then** the system redirects them to `/login`.
2. **Given** there is a valid authenticated session, **When** the user visits `/` or
   `/login`, **Then** the system redirects them to `/dashboard`.
3. **Given** a session is malformed, expired, or missing required authentication data,
   **When** the user visits a protected route, **Then** the system treats them as
   anonymous and redirects them to `/login`.
4. **Given** the user is already on `/login` without a valid session, **When** the route
   guard evaluates access, **Then** the user remains on `/login` without a redirect loop.

### User Story 5 - Accept the Backend Response Contract (Priority: P1)

As a user with valid credentials, I want the application to recognize the backend's
actual response field names so that a valid login is not rejected as malformed.

**Why this priority**: A field-name mismatch currently prevents every otherwise valid
backend login response from creating a session.

**Independent Test**: Return a successful response containing `Status`, `Message`, and a
complete `Data` object with the documented child fields; verify that the response creates
an authenticated session and redirects the user without a malformed-response error.

**Acceptance Scenarios**:

1. **Given** the backend returns `Status: 1` and a complete `Data` object, **When** the
   response is processed, **Then** the login succeeds and all required session fields are
   retained using the documented backend field names.
2. **Given** the backend returns a non-success `Status` and a `Message`, **When** the
   response is processed, **Then** the application presents the safe backend message and
   does not create an authenticated session.
3. **Given** the backend returns `Status: -131`, **When** the response is processed,
   **Then** the application displays the defined two-factor-development message and does
   not classify the response as malformed solely because successful session data is
   absent.
4. **Given** an HTTP-success response omits `Status`, uses lowercase `status`, or omits a
   required successful-session field from `Data`, **When** the response is processed,
   **Then** the application rejects it as malformed and does not persist a partial
   session.

### Edge Cases

- The identifier contains leading or trailing spaces; the system handles them
  consistently without changing the user's visible value unexpectedly.
- The password is entered with case differences; authentication follows the service's
  credential rules and does not silently transform the password.
- The user presses Enter repeatedly while the request is pending; only one active login
  request is submitted.
- A token is missing, malformed, expired, or rejected after redirect; the user is not
  treated as authenticated and receives a recoverable authentication outcome.
- The authentication service returns only part of the expected success payload; the
  system does not create a partial authenticated session and shows a recoverable error.
- The authentication service returns the correct `Status`, `Message`, and `Data` envelope
  with property insertion order different from examples; response handling remains
  unaffected.
- The response contains lowercase `status`, `message`, or `data` instead of the
  case-sensitive contract fields; it is not silently interpreted as the documented
  backend contract.
- `Status` indicates success but `Data` is null, is not an object, or lacks
  `access_token`, `refresh_token`, or required user context; no session is created.
- `roles` or `permissions` is present but empty; the response remains structurally valid
  when the backend intentionally grants no roles or permissions.
- Existing authentication data is present in localStorage before a new login succeeds;
  it is not overwritten by a failed login attempt.
- A previously authenticated user opens the login page; the system redirects them to the
  main page or otherwise avoids creating a conflicting session.
- The authentication response contains a generic failure; the UI avoids exposing
  sensitive details while still giving actionable feedback.
- A user opens a nested protected route directly in a new browser tab without a session;
  the redirect goes to `/login` rather than rendering protected content first.
- A user has stale localStorage data that cannot be parsed; the stale data is cleared or
  ignored and the user is redirected to `/login`.
- A user with a valid session visits `/` and `/login` repeatedly; the redirect settles on
  `/dashboard` without a loop.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a login form with a username field and a password
  field.
- **FR-002**: The system MUST require both identifier and password before submitting an
  authentication request.
- **FR-003**: The system MUST display field-specific validation feedback when required
  input is missing or invalid.
- **FR-004**: The system MUST submit the entered credentials to the authentication service
  only after client-side validation passes and a machine code has been generated.
- **FR-005**: The system MUST show a visible loading state while the authentication
  request is pending.
- **FR-006**: While authentication is pending, the system MUST prevent duplicate login
  submissions.
- **FR-007**: When authentication succeeds, the system MUST persist `Data.access_token`,
  `Data.refresh_token`, and the approved user/session information from `Data` in
  localStorage for subsequent authenticated requests and authenticated UI context.
- **FR-008**: When authentication succeeds, the system MUST redirect the user to the
  system's main page.
- **FR-009**: When credentials are rejected, the system MUST show a clear, user-safe
  error message, keep the user on the login page, and avoid persisting a new token.
- **FR-010**: When the authentication service is unavailable or returns an unexpected
  failure, the system MUST show a recoverable service error distinct from invalid
  credential feedback.
- **FR-011**: The system MUST end the loading state after both successful and failed
  authentication responses.
- **FR-012**: The system MUST NOT expose passwords or sensitive token values in user-facing
  messages, URLs, or diagnostic output.
- **FR-013**: The login interaction MUST be usable with keyboard navigation and provide
  accessible names and status feedback for its controls and errors.
- **FR-014**: The authentication response MUST use the case-sensitive top-level envelope
  `Status`, `Message`, and `Data`; a successful response MUST contain the JWT access
  token, refresh token, and user information inside `Data`.
- **FR-015**: The system MUST generate `machineCode` from the device fingerprint visitor
  identifier and include it with `username` and `password` in the login request.
- **FR-016**: When the authentication response `Status` is `1`, the system MUST persist
  the approved fields from `Data` and redirect the user to `/dashboard`.
- **FR-017**: When the authentication response `Status` is `-131`, the system MUST display
  "Tính năng xác thực 2 yếu tố đang phát triển" without starting a 2FA flow.
- **FR-018**: The persisted authentication record MUST keep `access_token` and
  `refresh_token` distinguishable and MUST preserve the approved returned user/session
  information without persisting the password.
- **FR-019**: The system MUST validate `Status` and, for a successful response, all
  required `Data` values before creating an authenticated session or redirecting the
  user.
- **FR-020**: The system MUST use a namespaced localStorage record for authentication data
  and MUST remove or replace stale authentication data according to the login outcome.
- **FR-021**: Automatic refresh-token renewal is out of scope for this feature; the
  persisted refresh token MUST remain available for a separately specified renewal flow.
- **FR-022**: The system MUST classify routes as public or protected and apply the same
  authentication-session rule consistently to every protected route.
- **FR-023**: When a user without a valid session requests any protected route, the system
  MUST redirect the user to `/login` before exposing protected content.
- **FR-024**: When a user with a valid session requests `/` or `/login`, the system MUST
  redirect the user to `/dashboard`.
- **FR-025**: The route protection logic MUST treat missing, malformed, or incomplete
  local authentication data as unauthenticated.
- **FR-026**: Public routes, including `/login`, MUST remain accessible to unauthenticated
  users and MUST NOT redirect them in a loop.
- **FR-027**: Response field names MUST be interpreted case-sensitively according to the
  backend contract: `Status`, `Message`, and `Data` are valid; `status`, `message`, and
  `data` MUST NOT be treated as equivalent aliases.
- **FR-028**: A successful `Data` object MUST support the backend fields `user_id`,
  `user_name`, `ToChuc_Id`, `access_token`, `refresh_token`, `roles`, `permissions`, and
  `exp_refresh` without renaming or dropping them before contract validation.
- **FR-029**: `Status` MUST determine the business outcome independently of the HTTP
  status code, while the HTTP status code MUST continue to distinguish transport-level
  success and failure.
- **FR-030**: When the backend supplies a safe `Message` for a failed login, the system
  MUST use that field as the service error message and MUST NOT attempt to read a
  lowercase `message` property.
- **FR-031**: The system MUST report `MALFORMED_RESPONSE` only when the documented
  case-sensitive envelope or the fields required for the applicable outcome are missing
  or invalid; a complete `Status: 1` response MUST NOT be rejected due to lowercase-field
  expectations in the client.
- **FR-032**: Shared response types, validation, session mapping, route-access checks, and
  login outcome handling MUST agree on the same documented field names and nesting.
- **FR-033**: Automated contract examples and tests MUST use the exact backend casing and
  MUST include a regression case proving that a valid `Status`/`Data` response is accepted.

### Key Entities *(include if feature involves data)*

- **Login Credentials**: The user-provided identifier and password submitted for
  authentication; the password is sensitive and must not be persisted by the UI.
- **Authentication Response Envelope**: The case-sensitive `Status`, `Message`, and
  `Data` structure returned by the backend. `Status` determines the business outcome,
  `Message` carries service feedback, and `Data` carries successful session context.
- **Authentication Session**: The authenticated state represented by `Data.access_token`,
  `Data.refresh_token`, `Data.exp_refresh`, organization context, roles, permissions, and
  authenticated user context. It is persisted in one namespaced localStorage record.
- **User Profile**: The backend user information identified by fields including
  `user_id`, `user_name`, and `ToChuc_Id`, retained for authenticated UI context.
- **Login Outcome**: The success, invalid-credential, validation, or service-failure
  result that determines the visible UI state and navigation behavior.
- **Route Access Policy**: The public/protected classification and redirect destination
  applied to each application route.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of users with valid credentials reach the main page within
  5 seconds of submitting the login form under normal service conditions.
- **SC-002**: 100% of successful authentication attempts preserve the authenticated
  session and user context before redirecting to the main page.
- **SC-003**: 100% of invalid-credential attempts show a clear error and do not create a
  new authenticated session.
- **SC-004**: 100% of submissions made while a request is pending result in at most one
  active authentication request.
- **SC-005**: At least 95% of test users can identify what to correct after an invalid
  submission without external assistance.
- **SC-006**: 100% of completed authentication requests, including service failures,
  leave the login interface in a non-loading state.
- **SC-007**: Keyboard-only users can complete or correct the login flow without requiring
  pointer interaction.
- **SC-008**: 100% of unauthenticated requests to protected routes redirect to `/login`
  without rendering protected content.
- **SC-009**: 100% of authenticated visits to `/` and `/login` redirect to `/dashboard`
  without a redirect loop.
- **SC-010**: 100% of malformed or incomplete stored sessions are treated as
  unauthenticated for route access decisions.
- **SC-011**: 100% of valid backend responses using `Status: 1` and a complete `Data`
  object create the expected authenticated session without a `MALFORMED_RESPONSE` error.
- **SC-012**: 100% of contract tests use the exact `Status`, `Message`, and `Data` casing,
  and at least one regression test rejects a lowercase-only envelope as undocumented.
- **SC-013**: 100% of successful-response tests preserve `user_id`, `user_name`,
  `ToChuc_Id`, `access_token`, `refresh_token`, `roles`, `permissions`, and `exp_refresh`
  through response validation and session creation.

## Assumptions

- The authentication service accepts `username`, `password`, and `machineCode`, and
  returns the case-sensitive `Status`, `Message`, and `Data` envelope. The response shape
  supplied in this amendment is authoritative over earlier lowercase examples.
- The main page route and authentication endpoint are defined during planning based on
  the existing backend contract.
- The requested localStorage persistence is an explicit product constraint. Because
  localStorage can be exposed by client-side script compromise, the plan MUST document
  the security trade-off, namespaced key, data lifetime, and cleanup behavior before
  implementation.
- This feature covers login only. Registration, password reset, multi-factor
  authentication, logout, and role administration are out of scope unless separately
  specified.
- `/login` is public. `/` is an entry route that redirects according to session state;
  application routes other than explicitly public routes are protected by default.
- The session check uses the existing localStorage authentication record and does not
  introduce automatic refresh-token renewal in this feature.
- The user has network access and an account recognized by the authentication service.
