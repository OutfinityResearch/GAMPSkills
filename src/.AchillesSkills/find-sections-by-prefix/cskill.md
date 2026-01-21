# find-sections-by-prefix
Filters backlog sections by fileKey prefix.

## Summary
Filters backlog sections by fileKey prefix.

## Input Format
- **backlogType** (string): Backlog identifier.
- **prefix** (string): Prefix to match (e.g. "specs/src/").

## Output Format
- **Type**: `array`
- **Success Example**: `["specs/src/api.md", "specs/src/routes.md"]`
- **Error Example**: `{ "error": "Backlog type not loaded." }`

## Constraints
- Return only fileKeys that start with the prefix.
