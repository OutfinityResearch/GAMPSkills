# append-section
Adds a new backlog section if it doesn't exist, returning updated sections.

## Summary
Adds a new backlog section if it doesn't exist, returning updated sections.

## Input Format
- **backlogType** (string): Backlog identifier (e.g. "specs", "docs").
- **fileKey** (string): Section key to insert.
- **section** (object): Initial section payload to store.

## Output Format
- **Type**: `object`
- **Success Example**: `{ "added": true, "sections": { "fileKey": {} } }`
- **Error Example**: `{ "error": "Backlog type not loaded." }`

## Constraints
- Do not overwrite existing sections.
- Validate `backlogType` is loaded before inserting.
