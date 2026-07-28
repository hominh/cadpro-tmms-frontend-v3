# Data Model: GitHub SDLC Workflow

## GitHub Issue

- **Purpose**: Source record for feature, bug, or engineering work.
- **Fields**: issue number, type, title, objective, scope, acceptance criteria, priority,
  dependencies, status, related specification, related pull request.
- **Validation**: Feature and bug issues require objective and acceptance criteria before
  planning; implementation work must link back to an issue.

## Specification

- **Purpose**: User-focused requirements for a feature.
- **Fields**: user stories, acceptance scenarios, edge cases, functional requirements,
  success criteria, assumptions.
- **Relationship**: One feature issue may reference one primary specification.

## Plan and Tasks

- **Purpose**: Technical decisions and dependency-ordered implementation work.
- **Fields**: technical context, constitution gates, research decisions, design artifacts,
  task IDs, dependencies, verification steps.
- **Relationship**: One specification produces one plan and one task list for the scoped
  feature.

## Pull Request

- **Purpose**: Reviewable implementation change.
- **Fields**: source branch, target branch, linked issue, summary, change type, validation
  evidence, risk, rollout or rollback notes, approvals, checks, merge status.
- **Validation**: A pull request targeting `main` requires the configured CI check, one
  approval, and resolved conversations.

## Workflow Run

- **Purpose**: Automated validation record.
- **Fields**: commit SHA, event, check name, status, logs, duration, conclusion.
- **Relationship**: Each pull request has one or more workflow runs.

## Release

- **Purpose**: Published group of merged changes.
- **Fields**: version/tag, date, summary, linked pull requests, linked issues, known
  limitations, rollback or recovery guidance.
- **Validation**: Every user-visible change in the release notes links to its source
  issue and pull request.

## Lifecycle

```text
Issue → Specification → Plan/Tasks → Pull Request → Workflow Run + Review → Merge → Release
```
