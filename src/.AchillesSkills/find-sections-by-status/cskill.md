# find-sections-by-status
Filters backlog sections by status.

## Summary
Filters backlog sections by status.

## Input Format
- **backlogType** (string): Backlog identifier.
- **status** (string): Status value (e.g. "ok", "needs_work", "blocked").

## Output Format
- **Type**: `array`
- **Success Example**: `["specs/src/api.md"]`
- **Error Example**: `{ "error": "Backlog type not loaded." }`

## Constraints
- Status must be compared as a normalized string.
