# update-section-content
Updates the content fields of a backlog section.

## Summary
Updates the content fields of a backlog section.

## Input Format
- **backlogType** (string): Backlog identifier.
- **fileKey** (string): Section key to update.
- **updates** (object): Fields to update (issues, options, resolution).

## Output Format
- **Type**: `object`
- **Success Example**: `{ "updated": true, "sections": { "fileKey": {} } }`
- **Error Example**: `{ "error": "Section not found." }`

## Constraints
- Only update provided fields.
- Preserve other section data.
