# backlog-expert

## Summary
Generates backlog-ready content (tasks, options, or resolutions). Provide natural language instructions for what to generate.

## Input Format
- **prompt** (string): Instructions in natural language for backlog content generation.
- **dependsOn** (string, optional): Dependency markers to enforce ordering; ignored by this skill.

## Output Format
- **Type**: `string`
- **Success Example**: "1. Add API integration task\n2. Draft UI copy for login"
- **Error Example**: "Error: Failed to generate backlog content."

## Constraints
- When generating task options, output ONLY numbered lines (e.g., "1.", "2.", "3.") with no extra prose or headings.
- When generating tasks, output ONLY numbered lines (e.g., "1.", "2.", "3.") with no extra prose or headings.
- For resolutions or single update text, respond with a concise plain-text paragraph.
- No commentary or headings.
