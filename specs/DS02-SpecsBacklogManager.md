# DS02 – SpecsBacklogManager

## Purpose
SpecsBacklogManager governs the single backlog file `./specs_backlog.md`, keeping all design specification issues and improvements in one place. It preserves transparency and human control: agents record what they find and suggest, while users approve before anything is applied. The backlog remains readable and intentionally simple so it can be inspected and edited manually at any moment.

## Role in the Specification Flow
When FDS files evolve, SpecsBacklogManager is the checkpoint that captures discoveries, concerns, and remedies. Agents log their observations in the backlog at the project root (`./specs_backlog.md`), while the actual specifications live under `./docs/specs`. The user stays in charge of approving changes. By working on focused sections instead of the entire backlog, the manager keeps context lean and prevents prompts from becoming bloated, allowing agents to stay on a single task or spec without being distracted by unrelated history.

## Backlog Structure (High-Level)
There is one backlog for all specs: `./specs_backlog.md`. It is organized into primary sections, one per specification file. Inside each section you will find a short description of the spec, a status such as `ok`, `broken`, or `needs-info`, plus space for issues and proposed fixes. Everything is plain text and human-editable so approvals and updates are straightforward.

## Principles
The manager enforces a human-in-the-loop approach: proposed fixes are written down, reviewed by the user, and only then applied. All operations are deterministic, implemented with classic JavaScript and no LLM calls. It practices strict context discipline, extracting only the section that matters so agents stay focused. The backlog is treated as the single source of truth for known issues and remedies across every DS file.

## Intended Capabilities of SpecsBacklogManager
SpecsBacklogManager loads and saves the backlog without hidden mutations, extracts or filters specific sections to keep context tight, and records issues with their proposed fixes under the right spec section using statuses like `ok`, `broken`, or `needs-info`. After the user approves a fix, the agent can apply changes to the target spec in `./docs/specs` with other GAMPSkills and then reflect the new state back in `./specs_backlog.md`. Every action stays deterministic and testable because it relies only on conventional JavaScript.

## Usage Pattern
An agent spots an issue in a spec and writes it to the relevant section of `./specs_backlog.md`, including a proposed fix and current status. The user reviews the backlog, approves or rejects the proposals, and only then are the approved changes applied to the FDS files. Once changes land, the backlog is updated to record the new status. Throughout this flow, agents avoid loading the entire backlog as context; they only fetch what is necessary for the spec they are improving.

## Outcomes
With SpecsBacklogManager in place, the project gains a clear, centralized backlog for all FDS issues and fixes, steady control of prompt size and focus, and a repeatable, deterministic way to keep specification changes under user approval. The result is tighter governance of specs and a smoother path from identified issue to approved improvement.
