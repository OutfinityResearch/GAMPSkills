# parse-file-markers
Extracts file contents from <!-- FILE: --> delimited output.

## Summary
Extracts file contents from <!-- FILE: --> delimited output.

## Input Format
- **rawText** (string): LLM response containing file markers.

## Output Format
- **Type**: `object`
- **Success Example**: `{ "docs/specs/vision.md": "# Vision..." }`
- **Error Example**: `{ "error": "No file markers found." }`

## Constraints
- Only parse content enclosed by file markers.
