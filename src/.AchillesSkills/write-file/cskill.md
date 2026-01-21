# write-file
Writes content to a file, creating directories as needed.

## Summary
Writes content to a file, creating directories as needed.

## Input Format
- **filePath** (string): Path to the file to write.
- **content** (string): File contents to write.

## Output Format
- **Type**: `object`
- **Success Example**: `{ "success": true, "filePath": "./docs/specs/vision.md" }`
- **Error Example**: `{ "error": "Unable to write file." }`

## Constraints
- Create parent directories if missing.
- Overwrite existing files.
