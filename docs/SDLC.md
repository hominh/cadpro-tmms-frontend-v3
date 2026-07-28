# Software Development Lifecycle

## Workflow

```text
GitHub Issue → Specify → Plan → Tasks → Feature branch → Pull Request
     ↑                                                    ↓
     └────────────── feedback / follow-up ← CI + review ←┘
                                      ↓
                            merge to main → release
```

1. Create a GitHub Issue using the feature, bug, or task template.
2. For a feature, use `/speckit-specify`, `/speckit-plan`, and `/speckit-tasks`.
3. Create a short-lived branch from `main`: `feature/<issue>-<name>`, `fix/<issue>-<name>`,
   or `chore/<issue>-<name>`.
4. Implement the tasks and keep commits focused. Update the issue when scope changes.
5. Open a pull request using the repository template and link the issue.
6. CI MUST pass. At least one reviewer MUST verify acceptance criteria and constitution
   compliance before merge.
7. Squash-merge the pull request into `main`. Delete the feature branch after merge.
8. Release from `main` using a version tag and release notes when the project has a
   releasable product. Hotfixes use `fix/` branches and the same review gate.

## Quality gates

- The PR has a linked issue and a clear user or maintenance outcome.
- Acceptance criteria and relevant edge cases are covered.
- Next.js conventions, Tailwind CSS, shadcn, TanStack Query, reuse, and accessibility
  requirements from the constitution are satisfied or explicitly justified.
- Loading, empty, error, and success states are verified where applicable.
- CI is green, or an exception is documented with owner and follow-up issue.

## GitHub setup checklist

After creating or connecting the GitHub repository, configure:

- Default branch: `main`.
- Required pull request review: at least 1 approval.
- Required status check: `CI / Validate frontend`.
- Require branch to be up to date before merge.
- Require conversation resolution and prevent force-pushes to `main`.
- Enable automatic deletion of head branches after merge.
- Add labels: `bug`, `enhancement`, `task`, `blocked`, `needs-spec`, and `priority-high`.

## Spec Kit mapping

- Feature discovery and requirements: `/speckit-specify`
- Architecture and technical decisions: `/speckit-plan`
- Dependency-ordered implementation work: `/speckit-tasks`
- Cross-artifact consistency review: `/speckit-analyze`
- Implementation: `/speckit-implement`

