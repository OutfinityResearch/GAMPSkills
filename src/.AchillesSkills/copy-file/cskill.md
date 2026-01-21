# copy-file
Copies a file from a source path to a destination path.

## Summary
Copies a file from a source path to a destination path.

## Input Format
- **sourcePath** (string): Absolute or relative path to the source file.
- **destinationPath** (string): Target path for the copied file.

## Output Format
- **Type**: `object`
- **Success Example**: `{ "success": true, "destinationPath": "./docs/specsLoader.html" }`
- **Error Example**: `{ "error": "Source file not found." }`

## Constraints
- Ensure the source file exists and is readable.
- Create parent directories for the destination when needed.
