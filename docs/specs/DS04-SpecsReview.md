# DS04 – Specs Review

## Purpose
Specs Review describes how the `review-specs` skill will analyze specifications so they can evolve safely and deliberately. Software projects rarely start with complete knowledge; errors, inconsistencies, and gaps inevitably surface. This skill provides a disciplined loop: it reads the current specifications and reports problems so they can be addressed deliberately, leaving final decisions to the user.

## Relationship to the Backlog
The review process relies on the root backlog file `./specs_backlog.md` when proposals need to be captured as tasks. The `review-specs` skill itself only produces a report; when backlog tasks are required, `backlog-specs-review` converts review findings into backlog entries. The backlog remains the gate: no change proceeds without the user’s explicit approval. This keeps the agent from unilaterally editing specifications even when instructions seem clear.

## Workflow
The skill scans the relevant specifications in `./docs/specs/`, looking for missing details, conflicting statements, or structural weaknesses, then returns a concise report. When those findings should be tracked formally, `backlog-specs-review` records task descriptions and proposed options in `./specs_backlog.md`. The user then reviews and approves, amends, or rejects these proposals. Only after approval do other GAMPSkills apply the changes to the specs themselves. At every step the review flow favors focused inspection—working on the sections that matter—so reviews stay precise and actionable.

## Guardrails and Intent
Specs Review does not directly change specification files; it produces observations. Backlog proposals are handled separately via `backlog-specs-review`. All operations are deterministic and transparent, relying on the backlog for coordination and on user approval for authority. By separating analysis from application, the process maintains traceability and prevents accidental drift in the specifications.

## Outcomes
With Specs Review in place, the project gains a reliable way to surface problems early, document them in the backlog, and advance only the fixes that the user endorses. This preserves clarity and trust in the specifications while enabling iterative progress as new information emerges.
