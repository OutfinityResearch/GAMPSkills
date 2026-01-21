# review-backlog-section
Evaluates a backlog section for coherence and completeness.

## Summary
Evaluates a backlog section for coherence and completeness.

## Input Format
- **section** (object): Backlog section data.
- **context** (string | object): Optional context for review.

## Output Format
- **Type**: `object`
- **Success Example**: `{ "status": "needs_work", "issues": ["Missing acceptance criteria"], "options": [] }`
- **Error Example**: `{ "error": "Section review failed." }`

## Constraints
- Return structured feedback with status and issues.
