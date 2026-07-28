# Quickstart: Validate the GitHub SDLC Workflow

## Prerequisites

- Access to `hominh/cadpro-tmms-frontend-v3` with permission to create branches and pull
  requests.
- GitHub Actions enabled.
- Branch protection configured for `main` after the first CI workflow is available.
- A local checkout on branch `minh_dev`.

## Scenario 1: Issue intake

1. Open a new GitHub Issue and select **Feature request**.
2. Fill in the problem, desired outcome, acceptance criteria, and constraints.
3. Confirm the issue has the `enhancement` label and a clear title.
4. Link the issue to `specs/001-github-sdlc/spec.md` in the issue discussion.

Expected result: another team member can understand the intended outcome and testable
acceptance criteria without a separate meeting.

## Scenario 2: Pull request gate

1. Create a short-lived branch from `main`.
2. Make a focused change and open a pull request linked with `Closes #<issue-number>`.
3. Confirm the PR template asks for validation, UI states, accessibility, API state, and
   rollout risk where applicable.
4. Confirm the CI workflow starts automatically.
5. Verify a failing required check blocks merge and a passing check allows review.
6. Obtain the required approval and resolve all conversations.

Expected result: only reviewed and validated changes can merge into `main`.

## Scenario 3: Release traceability

1. Merge a reviewed pull request.
2. Create a release or draft release containing the merged change.
3. Add a user-facing summary and links to the source issue and pull request.
4. Record known limitations and recovery guidance when applicable.

Expected result: the release can be traced back to its scope, implementation, review, and
validation evidence.

## Bootstrap note

If `package.json` is not present, CI reports that frontend checks are not yet active.
After the Next.js application and lockfile are added, verify that lint, type-check, test,
and build commands run successfully and then make the CI check required in branch
protection.
