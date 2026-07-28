# Research: GitHub SDLC Workflow

## Decision: Use issue-first, short-lived branch delivery

**Rationale**: An issue provides scope and acceptance criteria before implementation;
short-lived branches keep changes isolated and make pull requests reviewable.

**Alternatives considered**: Direct commits to `main` were rejected because they remove
the review and validation gate. Long-lived release branches were deferred because the
repository is bootstrapping and does not yet require parallel release trains.

## Decision: Use pull requests as the mandatory integration gate

**Rationale**: Pull requests provide one place for linked issues, CI results, review
conversation, verification evidence, and rollout risk.

**Alternatives considered**: Manual review outside GitHub was rejected because it breaks
traceability and cannot be enforced by branch protection.

## Decision: Start with one required reviewer and required CI

**Rationale**: One approval is an appropriate initial gate for a small team. The required
CI check establishes a consistent minimum quality bar without prescribing a specific
test framework before the frontend manifest exists.

**Alternatives considered**: Two approvals were deferred until team size and change risk
justify the additional throughput cost. No required checks were rejected because they
would allow unvalidated changes to reach `main`.

## Decision: Keep bootstrap CI explicit and temporary

**Rationale**: The current repository has no package manifest, so lint, type-check, test,
and build commands cannot run yet. The workflow reports this state and will activate the
checks when the app is added.

**Alternatives considered**: A permanently skipped CI job was rejected because it could
hide missing validation after the application is created.

## Decision: Use Spec Kit artifacts for feature traceability

**Rationale**: The existing project constitution and Spec Kit templates already define a
repeatable path from specification to plan, tasks, and implementation. Linking these
artifacts to the issue keeps user intent and technical work connected.

**Alternatives considered**: A separate project-management system was rejected for the
initial workflow because it would duplicate GitHub records.
