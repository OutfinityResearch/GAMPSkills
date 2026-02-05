# fds-expert
Generates File Design Specification (FDS) content with technical implementation details.

## Summary
Generates File Design Specification (FDS) content with technical implementation details. Provide natural language instructions describing the technical module or component to be specified.

## Input Format
- **prompt** (string): User instructions for FDS content generation.
- **dependsOn** (string, optional): Dependency markers to enforce ordering; ignored by this skill.

Examples:
- "Create FDS for user authentication module"
- "Generate file specification for database connection handler"
- "Write FDS for equipment management API endpoints"

## Output Format
- **Type**: `string`
- **Success Example**: "# ModuleName\n\n## Description\n...\n## Dependencies\n..."
- **Error Example**: "Error: Failed to generate FDS content."

## Constraints
- FDS files must be technical and implementation-focused.
- Include: Description, Dependencies, Functions/Methods, Exports, Implementation details.
- Content must enable code regeneration from specification.
