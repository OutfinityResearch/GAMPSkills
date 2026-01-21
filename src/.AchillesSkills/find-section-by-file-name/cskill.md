# find-section-by-file-name
Finds a backlog section by filename suffix.

## Summary
Finds a backlog section by filename suffix.

## Input Format
- **backlogType** (string): Backlog identifier.
- **filename** (string): Filename suffix to match (e.g. "vision.md").

## Output Format
- **Type**: `string | null`
- **Success Example**: `"specs/global/vision.md"`
- **Error Example**: `{ "error": "Backlog type not loaded." }`

## Constraints
- Match by suffix only; return the first match.
