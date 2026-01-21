# merge-file-content
Applies updates to existing file content using LLM guidance.

## Summary
Applies updates to existing file content using LLM guidance.

## Input Format
- **filePath** (string): File being updated.
- **content** (string): Current file content.
- **instructions** (string): Change instructions to apply.

## Output Format
- **Type**: `string`
- **Success Example**: "Updated file content with applied changes."
- **Error Example**: "Error: Unable to merge changes."

## Constraints
- Preserve content not explicitly changed.
- Return the full revised file content.
