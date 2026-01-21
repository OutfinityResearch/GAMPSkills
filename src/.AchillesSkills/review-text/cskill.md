# review-text
Analyzes text for quality, gaps, and improvements.

## Summary
Analyzes text for quality, gaps, and improvements.

## Input Format
- **content** (string): Text to review.
- **criteria** (string | object): Optional review criteria.

## Output Format
- **Type**: `object`
- **Success Example**: `{ "status": "ok", "issues": [], "options": [] }`
- **Error Example**: `{ "error": "Text review failed." }`

## Constraints
- Return structured feedback with status and issues.
