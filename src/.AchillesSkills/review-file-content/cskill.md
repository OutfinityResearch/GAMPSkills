# review-file-content
Reviews file content against standards or context.

## Summary
Reviews file content against standards or context.

## Input Format
- **filePath** (string): File path being reviewed.
- **content** (string): Current file content.
- **context** (string | object): Optional review context.

## Output Format
- **Type**: `object`
- **Success Example**: `{ "status": "needs_work", "issues": ["Broken link"], "options": [] }`
- **Error Example**: `{ "error": "Content review failed." }`

## Constraints
- Return structured feedback with status and issues.
