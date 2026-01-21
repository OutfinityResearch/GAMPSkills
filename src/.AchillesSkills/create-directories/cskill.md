# create-directories
Creates directory paths recursively.

## Summary
Creates directory paths recursively.

## Input Format
- **paths** (array of string): Directory paths to create.

## Output Format
- **Type**: `object`
- **Success Example**: `{ "created": ["./docs", "./docs/specs"] }`
- **Error Example**: `{ "error": "Permission denied." }`

## Constraints
- Create parent directories as needed.
- Ignore paths that already exist.
