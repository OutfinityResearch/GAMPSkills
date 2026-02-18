# quality-expert

## Summary
Reviews and fixes content quality for a single file based on a profile and context. Returns the updated file content when changes are needed; otherwise returns the original content unchanged.

## Input Format
- **fileContent** (string): File content to review and potentially fix.
- **profile** (string): Review profile (`ds`, `fds`, `docs`, `code`).
- **context** (string): Relevant context for the file (other file contents, rules, constraints).
- **dependsOn** (string, optional): Dependency markers to enforce ordering; ignored by this skill.

Rules:
- Input is a single string containing the parameters in order: `fileContent: <content> profile: <value> context: <context>`.
- Values may span multiple lines.
- `fileContent` consumes everything up to the next `profile:` token.
- `context` consumes the rest of the input after `context:`.

## Output Format
- **Type**: `string`
 - **Success Example**: "# Updated content..."
 - **Error Example**: "Error: quality-expert: Missing required parameter fileContent."

## Constraints
- Returns the original `fileContent` if no modifications are needed.
- Throws an error for unsupported profiles (docs/code are TBD).
