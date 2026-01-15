# DS06 – Skills Inventory

## Purpose
Skills Inventory lists the core GAMPSkills that coordinate how specifications and documentation are created, reviewed, and refined. They share a common contract: specifications live under `./docs/specs`, documentation under `./docs`, and the root backlogs `./specs_backlog.md` and `./docs_backlog.md` mediate all proposed changes. Agents propose; users approve; deterministic skills apply; backlogs are updated to keep traceability intact.

## Skill: init-project
This skill initializes a fresh project by creating `./docs`, `./docs/specs`, `./docs/specs/src`, and `./docs/specs/tests`, along with the root backlogs `./specs_backlog.md` and `./docs_backlog.md`. It consumes a user prompt describing the intended project and seeds `./specs_backlog.md` with questions and proposals that reflect the prompt’s complexity, including suggestions for which specification files to create next.

## Skill: create-global-specs
After initialization, this skill generates global FDS files that capture vision, scope, audience, components, and workflow. It uses `./specs_backlog.md` plus additional user prompt context to propose and produce the global specifications that anchor the project.

## Skill: review-specs
This skill reads existing FDS files under `./docs/specs`—both global files and local FDS files in `./docs/specs/src`—to find gaps, inconsistencies, and errors. It records issues and proposed fixes in `./specs_backlog.md`, keeping the backlog as the sole gate for changes. No FDS files are modified directly by this skill.

## Skill: review-docs
This skill examines authored HTML documentation under `./docs`, including `./docs/index.html` and other linked pages, but not runtime-generated HTML produced from specs. It notes problems in `./docs_backlog.md`, proposing remedies that require user approval before any edits occur.

## Skill: fix-specs
This skill reads `./specs_backlog.md`, applies the user-approved fixes to specification files in `./docs/specs`, and then updates the backlog to reflect current statuses and any other affected sections. It respects the backlog as the source of approved work and performs deterministic edits only.

## Skill: fix-docs
This skill reads `./docs_backlog.md`, applies user-approved fixes to authored HTML documentation under `./docs`, and updates the docs backlog to capture the new state. It edits only the documentation files implicated by the approved items.

## Skill: create-src-specs
This skill produces detailed technical FDS files in `./docs/specs/src`, mirroring the structure of the future implementation in `./src`. It describes exposed functions, inputs and outputs, dependencies on other project files or external/native libraries, and links to related test specifications. It uses global specs plus a user prompt for context. When target files already exist, it merges rather than wholesale replacing content, preserving existing material while integrating the new plan.

## Skill: docs-project
This skill reads an existing codebase and generates documentation for it, creating or updating `./docs/index.html` and other relevant HTML pages. It uses the source code and a user prompt for context. If `./docs` already exists, it overwrites only the affected files it regenerates and leaves untouched files as they are.

## Outcomes
Together these skills provide a complete loop: initialize a project, draft global specs, deepen into technical specs, review and backlog proposals, apply approved fixes, and document the resulting system. The backlogs at the project root keep authority with the user, while deterministic skills ensure every change to specs or documentation is deliberate, traceable, and regenerable.
