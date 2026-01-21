# scan-directory
Lists files in a directory with optional filters.

## Summary
Lists files in a directory with optional filters.

## Input Format
- **rootPath** (string): Directory to scan.
- **options** (object, optional): `recursive`, `include`, `exclude` settings.

## Output Format
- **Type**: `array`
- **Success Example**: `["src/index.js", "src/utils/helpers.js"]`
- **Error Example**: `{ "error": "Directory not found." }`

## Constraints
- Respect include/exclude patterns.
- Return relative paths from the root.
