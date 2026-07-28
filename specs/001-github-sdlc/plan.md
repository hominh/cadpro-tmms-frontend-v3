# Implementation Plan: GitHub SDLC Workflow

**Branch**: `minh_dev` | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-github-sdlc/spec.md`

## Summary

Establish a repeatable GitHub-based SDLC for `hominh/cadpro-tmms-frontend-v3`.
The workflow will connect structured issues to Spec Kit artifacts, short-lived branches,
pull requests, automated validation, protected merges, and traceable releases. The
repository is currently bootstrapping, so CI will activate checks as the Next.js
application manifest and source are added.

## Technical Context

**Language/Version**: TypeScript/Node.js 20 for the planned Next.js frontend; repository
source manifest is not present yet

**Primary Dependencies**: GitHub Issues, Pull Requests, Actions; Next.js, Tailwind CSS,
shadcn UI, TanStack Query per constitution

**Storage**: Git repository and GitHub issue, pull request, workflow, and release metadata

**Testing**: GitHub Actions runs available lint, TypeScript, test, and production build
commands; exact test runner will follow the package manifest when added

**Target Platform**: GitHub-hosted repository and CI; web frontend deployment platform
is outside this feature's scope

**Project Type**: Web application repository and development workflow

**Performance Goals**: Pull request validation starts automatically and provides a result
within 10 minutes for the initial frontend scope

**Constraints**: `main` is the assumed default branch; branch protection and repository
administration require GitHub maintainer permissions; CI must remain non-blocking during
bootstrap when no package manifest exists, while clearly reporting that checks are not
yet active

**Scale/Scope**: One GitHub repository, one default branch, three issue forms, one PR
template, one CI workflow, and a small team using one required reviewer initially

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Architecture**: PASS. The workflow documents the Next.js repository boundary and
  does not introduce an alternate application architecture.
- **UI system**: PASS. The PR quality gate explicitly checks Tailwind/shadcn reuse for
  user-facing work.
- **Data access**: PASS. The PR quality gate explicitly checks TanStack Query for
  client-side server state where applicable.
- **Reuse**: PASS. The PR checklist requires reuse or documented justification.
- **Quality**: PASS. Issue and PR workflow requires acceptance criteria, UI state checks,
  accessibility checks, and automated validation when available.
- **Exceptions**: None. No Complexity Tracking entry is required.

## Project Structure

### Documentation (this feature)

```text
specs/001-github-sdlc/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── checklists/requirements.md
```

### Source Code (repository root)

```text
.github/
├── ISSUE_TEMPLATE/
├── pull_request_template.md
└── workflows/ci.yml

docs/SDLC.md
.specify/
└── memory/constitution.md
```

The existing Next.js application paths will be documented in a future application plan
once the source manifest is present; this SDLC feature does not create feature routes or
UI components.

**Structure Decision**: Keep process configuration in `.github/`, workflow guidance in
`docs/`, and requirements/design artifacts in `specs/`. CI discovers the eventual
frontend commands from the repository package manifest rather than hard-coding a second
project structure.

## Complexity Tracking

No constitution violations or justified complexity exceptions.
