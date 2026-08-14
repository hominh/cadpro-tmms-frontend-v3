<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0
Modified principles: I. Next.js Application Architecture (clarified Next.js, not Vite);
II. Tailwind CSS and shadcn UI -> II. shadcn UI and Legacy Design Fidelity
Added sections: none
Removed sections: none
Templates requiring updates: ✅ .specify/templates/plan-template.md;
✅ .specify/templates/spec-template.md; ✅ .specify/templates/tasks-template.md
Command files requiring updates: ✅ installed speckit skill files reviewed; no outdated project-specific governance references found
Runtime guidance: ✅ docs/SDLC.md; ✅ .github/pull_request_template.md
Follow-up TODOs: TODO(RATIFICATION_DATE): original adoption date is not recorded in the repository
-->

# CADPRO TMMS Frontend Constitution

## Core Principles

### I. Next.js Application Architecture

The application MUST use Next.js as its web application framework, development server,
and production build pipeline; it MUST NOT be implemented or scaffolded as a Vite
application. New routes, pages, layouts, and server/client boundaries MUST follow the
existing Next.js conventions and use the framework's routing and rendering capabilities
where applicable. Test tooling MAY use Vite internals when required by Vitest, but this
MUST NOT introduce a Vite application entry point or build path. Rationale: a single
application framework keeps navigation, rendering, and project structure predictable.

### II. shadcn UI and Legacy Design Fidelity

All user-facing UI MUST use Tailwind CSS and the project's shadcn/ui component system;
Flowbite React components and Flowbite-specific UI patterns MUST NOT be introduced. For
every new or migrated screen, layout, or component, the implementation MUST first inspect
the equivalent UI in the sibling `cadpro-tmms-frontend` project and reproduce its style,
layout, spacing, sizing, and color treatment with shadcn/ui composition. A new visual
design is permitted only when no legacy equivalent exists or an explicit product
requirement requires a change, and the deviation MUST be documented in the feature plan.
Custom primitives are permitted only when shadcn/ui cannot provide the required behavior.
Rationale: the migration changes the implementation system without changing the product's
established visual language or user familiarity.

### III. TanStack Query API Integration

Client-side API calls and server-state synchronization MUST use TanStack Query. Query
keys, cache behavior, loading states, error states, and invalidation behavior MUST be
defined consistently with the feature's data flow. Direct ad hoc fetching in UI
components MUST NOT replace the established query layer without documented justification.
Rationale: centralized server-state management makes asynchronous behavior predictable
and avoids duplicated caching logic.

### IV. Reusable Components

Components MUST be designed for reuse when the same interaction, presentation pattern,
or domain behavior appears in more than one place. Shared components MUST expose clear,
focused props and MUST NOT contain feature-specific assumptions that prevent reuse.
Feature-specific composition belongs at the feature boundary. Rationale: reuse improves
consistency while keeping feature code easier to evolve.

### V. Quality and Accessibility

Every user-facing feature MUST provide explicit loading, empty, error, and success
states where those states are possible. Interactive controls MUST be keyboard usable,
have accessible names, and preserve sufficient visual state contrast. Plans MUST identify
the appropriate validation strategy, and implementation tasks MUST include relevant tests
or documented manual verification. Rationale: predictable failure behavior and accessible
interactions are part of the product contract.

## Technology Constraints

The baseline frontend stack is Next.js, Tailwind CSS, shadcn/ui components, and TanStack
Query. Vite MUST NOT replace the Next.js application or build pipeline, and Flowbite React
MUST NOT be used for application UI. Feature plans MUST record these dependencies and
identify any exception. New UI dependencies MUST be justified when an existing shadcn/ui
or project utility cannot satisfy the requirement. API integration MUST respect the
project's established authentication, error, and environment configuration conventions.

## Development Workflow

Feature work MUST begin with a specification and implementation plan. The plan's
Constitution Check MUST be passed before implementation and re-checked after design.
For user-facing work, the specification and plan MUST identify the corresponding legacy
screen or component in `cadpro-tmms-frontend`, or explicitly state that none exists. Tasks
MUST identify concrete repository paths, name the shadcn/ui primitives used, map
user-story work to independently verifiable increments, and include visual comparison
against the legacy UI plus cross-cutting UI states and API behavior when relevant. Code
review MUST verify constitution compliance, especially legacy design fidelity, shadcn/ui
composition, component reuse, TanStack Query usage, accessibility, and justified
deviations.

## Governance

This constitution is the governing standard for frontend architecture and UI/API
implementation decisions. Amendments MUST be proposed as a change to this file, include
an updated Sync Impact Report, explain affected principles, and update dependent Spec Kit
templates when their generated artifacts would otherwise become inconsistent. Reviewers
MUST reject or request justification for work that violates a MUST rule. Exceptions MUST
be explicit, narrowly scoped, and documented in the relevant plan's Complexity Tracking
section.

Versioning follows semantic versioning: MAJOR for incompatible removals or
redefinitions, MINOR for new or materially expanded principles or sections, and PATCH
for clarifications and non-semantic wording changes. Compliance MUST be reviewed during
planning and code review, with a periodic review when the technology stack or shared UI
system changes.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date is not recorded in the repository | **Last Amended**: 2026-08-14
