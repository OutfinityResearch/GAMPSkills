# DS05 – Docs Review

## Purpose
Docs Review explains how `review-docs` skill analyzes authored documentation pages under `./docs` so they can evolve safely and remain accurate. Documentation starts with the home entry point at `./docs/index.html` and can link to other HTML pages and to specifications rendered as needed. A static (non-LLM) converter is copied into `./docs` during `init-project` to render specs when viewed, but the review covers only the authored HTML files, not the generated spec renderings.

## Relationship to the Docs Backlog
The review process relies on a dedicated backlog at the project root: `./docs_backlog.md`. When `review-docs` finds problems in authored documentation, it records them as entries in this backlog with the same structure used by the specs backlog: Description, Status (`ok`, `needs_work`, or `blocked`), Options, and Resolution (the option chosen by the user to be applied). The backlog remains the gatekeeper: the agent can propose changes, but the user must review and approve them before anything is applied.

## Workflow
The skill inspects the authored HTML files under `./docs`, including `./docs/index.html` and any linked documentation pages. It looks for inaccuracies, omissions, inconsistencies, and quality problems. For each finding, it writes a task description, proposed options, and the user-chosen resolution into `./docs_backlog.md`. The user then approves, amends, or rejects these proposals. Once approved, another GAMPSkills skill will perform the actual HTML edits and update the backlog to reflect the new state. Docs Review itself remains read-only on the documentation files.

## Guardrails and Scope
Docs Review analyzes all authored `.html` files under `./docs`, excluding only the static converter that turns `.md` into `.html` at runtime. It records proposals in the backlog, relies on user approval for authority, and hands off approved edits to another skill that performs deterministic changes. By separating review from application, the process preserves traceability and prevents accidental or unilateral modifications to project documentation.

## Outcomes
With Docs Review in place, the project gains a reliable way to surface documentation problems, document them in `./docs_backlog.md`, and advance only the fixes that the user endorses. This protects the accuracy and clarity of the documentation while keeping control in the hands of the user and maintaining a clean separation between analysis and editing.
