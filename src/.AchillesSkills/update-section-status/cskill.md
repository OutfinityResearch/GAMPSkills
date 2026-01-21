# update-section-status
Updates the status field of a backlog section.

## Summary
Updates the status field of a backlog section.

## Input Format
- **backlogType** (string): Backlog identifier.
- **fileKey** (string): Section key to update.
- **status** (string): New status value.

## Output Format
- **Type**: `object`
- **Success Example**: `{ "updated": true, "sections": { "fileKey": { "status": "ok" } } }`
- **Error Example**: `{ "error": "Section not found." }`

## Constraints
- Status must be one of the allowed values (e.g. "ok", "needs_work", "blocked").
