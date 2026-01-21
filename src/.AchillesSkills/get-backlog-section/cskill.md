# get-backlog-section
Retrieves a specific backlog section by fileKey.

## Summary
Retrieves a specific backlog section by fileKey.

## Input Format
- **backlogType** (string): Backlog identifier.
- **fileKey** (string): Section key to retrieve.

## Output Format
- **Type**: `object | null`
- **Success Example**: `{ "fileKey": "specs/src/api.md", "status": "ok" }`
- **Error Example**: `{ "error": "Backlog type not loaded." }`

## Constraints
- Return `null` when the section is missing.
