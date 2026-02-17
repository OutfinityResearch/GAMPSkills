# DS06 – Skills Inventory

## Purpose
Skills Inventory lists the core GAMPSkills that coordinate how specifications and documentation are created, reviewed, and refined. They share a common contract: specifications live under `./docs/specs`, documentation under `./docs`, and the root backlogs `./specs_backlog.md` and `./docs_backlog.md` mediate all proposed changes. Agents propose; users approve; deterministic skills apply; backlogs are updated to keep traceability intact.

## Skill: init-project
This skill initializes a fresh project by creating `./docs`, `./docs/specs`, `./docs/specs/src`, and `./docs/specs/tests`, along with the root backlogs `./specs_backlog.md` and `./docs_backlog.md`. It also copies the static (non-LLM) spec-to-HTML converter into `./docs` for viewing specs as HTML. It consumes a user prompt describing the intended project, creates the initial global DS files under `./docs/specs`, and seeds `./specs_backlog.md` with questions and proposals that reflect the prompt’s complexity, including suggestions for which specification files to create next.

## Skill: backlog-api
This deterministic code skill wraps BacklogManager operations with a compact prompt format. It expects the first token to be the operation, the second token to be the backlog type (`specs` or `docs`), and any remaining text to be chained `key: value` parameters (such as `taskId`, `proposal`, `resolution`, `status`, `updates`, `initialContent`). For `proposal` and `updates`, JSON values are accepted when the value starts with `{` or `[`. If the operation or type is invalid, it falls back to LLM-based argument extraction. It returns the underlying BacklogManager result or a simple success string for status, update, and append operations.

## Skill: file-system
This deterministic code skill exposes basic file operations. It reads the first token as the operation, the second token as the path, and the remainder as either `content:` or `destination:` payloads (or raw content for write/append). Supported operations are `readFile`, `writeFile`, `appendFile`, `deleteFile`, `createDirectory`, `listDirectory`, `fileExists`, `copyFile`, and `moveFile`. `readFile` returns a success message only (it does not return file contents). `copyFile` and `moveFile` require a destination. If parsing fails, it falls back to LLM-based argument extraction.

## Skill: ds-expert
This LLM-backed skill generates high-level Design Specification content. It builds a concise DS prompt, calls `llmAgent.executePrompt` in `deep` mode, and returns the trimmed string response. The input prompt is resolved from `prompt`, `input`, or the first provided argument value.

## Skill: fds-expert
This LLM-backed skill generates File Design Specification content for a single module/file. It enforces a short, structured prompt with fixed sections (Description, Dependencies, Main Functions/Methods, Exports, Implementation Details), calls `llmAgent.executePrompt` in `deep` mode, and returns the trimmed string response. The input prompt is resolved from `prompt`, `input`, or the first provided argument value.

## Skill: review-specs
This LLM-backed skill reviews specification content and returns a plain text report of gaps, inconsistencies, and improvement areas. It does not write files or update backlogs.

## Skill: backlog-specs-review
This skill reads existing specification files under `./docs/specs` to find gaps, inconsistencies, and errors. It records findings and proposed options in `./specs_backlog.md`, keeping the backlog as the sole gate for changes. Backlog operations for specs are handled through BacklogManager on `./specs_backlog.md`.

## Skill: review-docs
This skill examines `.hmtl` files under `./docs`, except the `html` static converter. It notes problems in `./docs_backlog.md`, proposing options that require user approval before any edits occur. Backlog operations for docs are handled through BacklogManager on `./docs_backlog.md`.

## Skill: run-specs-tasks
This skill reads `./specs_backlog.md`, applies the user-approved resolution to specification files in `./docs/specs`, and then updates the backlog to reflect current statuses and any other affected sections. It respects the backlog as the source of approved work.

## Skill: fix-docs
This skill reads `./docs_backlog.md`, applies the user-approved resolution to authored HTML documentation under `./docs`, and updates the docs backlog to capture the new state. It edits only the documentation files implicated by the approved items.

## Skill: create-src-specs
This skill produces detailed technical FDS files in `./docs/specs/src`, mirroring the structure of the future implementation in `./src`. It describes exposed functions, inputs and outputs, dependencies on other project files or external/native libraries, and links to related test specifications. It uses global specs under `./docs/specs` plus a user prompt for context. When target files already exist, it merges rather than wholesale replacing content, preserving existing material while integrating the new plan.

## Skill: create-tests-specs
This skill produces detailed FDS test specifications in `./docs/specs/tests`, describing assertions, expected inputs and outputs, and any relevant scenarios or diagrams, without emitting code. It uses global specs under `./docs/specs` and a user prompt for context to define how behaviors should be validated.

## Skill: docs-project
This skill reads an existing codebase and generates documentation for it, creating or updating `./docs/index.html` and other relevant HTML pages. It uses the source code and a user prompt for context. If `./docs` already exists, it overwrites only the affected files it regenerates and leaves untouched files as they are.

## Skill: run-tests
This skill executes the existing test suite and reports which tests pass or fail. Test code itself is generated by the dedicated AchillesCLI dynamic code generation skill, not by GAMPSkills. The results can be fed back into `review-specs` and `backlog-specs-review` when failures are found.

## Outcomes
Together these skills provide a complete loop: initialize a project, draft global specs, deepen into technical specs, author test specs, review and backlog proposals, apply user-approved resolutions, generate or regenerate code via the AchillesCLI dynamic code generation skill, and document the resulting system. Backlog operations run through BacklogManager as the shared gatekeeper for `./specs_backlog.md` and `./docs_backlog.md`. Actual JavaScript code (including tests) is handled by that dedicated AchillesCLI skill invoked explicitly by the user, using the specification files as authoritative input. The backlogs at the project root keep authority with the user, while deterministic skills ensure every change to specs or documentation is deliberate, traceable, and regenerable.
