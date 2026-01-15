# DS04 – Specs Review

## Purpose
Specs Review describes how the forthcoming `review-specs` skill will analyze specifications so they can evolve safely and deliberately. Software projects rarely start with complete knowledge; errors, inconsistencies, and gaps inevitably surface. This skill provides a disciplined loop: it reads the current specifications, identifies issues, and records proposals in the shared backlog, leaving final decisions to the user.

## Relationship to the Backlog
The review process relies on the root backlog file `./specs_backlog.md`. The skill inspects the specifications under `./docs/specs/` and, when it finds problems or ambiguities, it writes them to the backlog as issues with proposed fixes. The backlog remains the gate: no change proceeds without the user’s explicit approval. This keeps the agent from unilaterally editing specifications even when instructions seem clear.

## Workflow
The skill scans the relevant specifications in `./docs/specs/`, looking for missing details, conflicting statements, or structural weaknesses. For each finding, it records the issue and a proposed remedy in `./specs_backlog.md`, organized under the appropriate specification section. The user then reviews and approves, amends, or rejects these proposals. Only after approval do other GAMPSkills apply the changes to the specs themselves. At every step the review skill favors focused inspection—working on the sections that matter—so reviews stay precise and actionable.

## Guardrails and Intent
Specs Review does not directly change specification files; it produces observations and proposals. All operations are deterministic and transparent, relying on the backlog for coordination and on user approval for authority. By separating analysis from application, the process maintains traceability and prevents accidental drift in the specifications.

## Outcomes
With Specs Review in place, the project gains a reliable way to surface issues early, document them in the backlog, and advance only the fixes that the user endorses. This preserves clarity and trust in the specifications while enabling iterative progress as new information emerges.
