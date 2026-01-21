# find-approved-sections
Finds backlog sections with approved resolutions.

## Summary
Finds backlog sections with approved resolutions.

## Input Format
- **backlogType** (string): Backlog identifier (e.g. "specs", "docs").

## Output Format
- **Type**: `array`
- **Success Example**: `["specs/global/vision.md", "specs/src/api.md"]`
- **Error Example**: `{ "error": "Backlog type not loaded." }`

## Constraints
- Only include sections whose Resolution field is non-empty.
