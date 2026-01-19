# DS02 – BacklogManager

## Purpose
BacklogManager governs the two root backlog files `./specs_backlog.md` and `./docs_backlog.md`, keeping all specification and documentation issues and improvements in one place. It preserves transparency and human control: agents record what they find and suggest, while users approve before anything is applied. The backlog remains readable and intentionally simple so it can be inspected and edited manually at any moment.

## Role in the Specification Flow
When specification files or docs evolve, BacklogManager is the checkpoint that captures discoveries, concerns, and remedies. Agents log their observations in the appropriate backlog at the project root (`./specs_backlog.md` or `./docs_backlog.md`), while the actual specifications live under `./docs/specs` and documentation under `./docs`. The user stays in charge of approving changes. By working on focused sections instead of the entire backlog, the manager keeps context lean and prevents prompts from becoming bloated, allowing agents to stay on a single task or spec without being distracted by unrelated history.

## Backlog Structure (High-Level)
There are two backlogs, one for specs (`./specs_backlog.md`) and one for docs (`./docs_backlog.md`). Each is organized into primary sections, one per file. Inside each section you will find: Description (what the file should contain), Status (`ok`, `needs_work`, or `blocked`), Issues (detected problems or next steps), Options (agent-proposed solutions), and Resolution (the option chosen by the user to be applied). Everything is plain text and human-editable so approvals and updates are straightforward.

## Principles
The manager enforces a human-in-the-loop approach: proposed fixes are written down, reviewed by the user, and only then applied. All operations are deterministic, implemented with classic JavaScript and no LLM calls. It practices strict context discipline, extracting only the section that matters so agents stay focused. The backlogs are treated as the single sources of truth for known issues and remedies across specifications and documentation.

## Constants
- `SPECS_BACKLOG = "specs"` - Identifier for the specifications backlog (`./specs_backlog.md`).
- `DOCS_BACKLOG = "docs"` - Identifier for the documentation backlog (`./docs_backlog.md`).

## Intended Capabilities of BacklogManager
BacklogManager loads and saves either backlog without hidden mutations, extracts or filters specific sections to keep context tight, and records issues under the right section using statuses like `ok`, `needs_work`, or `blocked`, along with proposed options and the user-chosen resolution. After the user approves a fix, the agent can apply changes to the target specs in `./docs/specs` or docs in `./docs` with other GAMPSkills and then reflect the new state back in the appropriate backlog file. Every action stays deterministic and testable because it relies only on conventional JavaScript.

### Core Methods
- `loadBacklog(type)`: Loads the backlog identified by `type` (`"specs"` or `"docs"`), resolving to `./specs_backlog.md` or `./docs_backlog.md`.
- `saveBacklog(type, content)`: Saves the provided `content` to the backlog identified by `type`.

## Usage Pattern
An agent spots an issue in a spec or doc and writes it to the relevant section of `./specs_backlog.md` or `./docs_backlog.md`, including the current status, issues found, proposed options, and the user-chosen resolution. The user reviews the backlog, approves or rejects the proposals, and only then are the approved changes applied to the affected specification files or HTML docs. Once changes land, the corresponding backlog is updated to record the new status. Throughout this flow, agents avoid loading the entire backlog as context; they only fetch what is necessary for the item they are improving.

## Outcomes
With BacklogManager in place, the project gains clear, centralized backlogs for all specification and documentation issues and fixes, steady control of prompt size and focus, and a repeatable, deterministic way to keep changes under user approval. The result is tighter governance of specs and docs and a smoother path from identified issue to approved improvement.
