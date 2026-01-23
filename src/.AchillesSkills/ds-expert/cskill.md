# ds-expert
Generates Design Specification (DS) content with global vision and high-level feature descriptions.

## Summary
Generates Design Specification (DS) content with global vision and high-level feature descriptions. Provide natural language instructions describing the project vision and requirements.

## Input Format
- **prompt** (string): User instructions for DS content generation.

Examples:
- "Create a DS for a web app that manages equipment and materials"
- "Generate design specification for inventory management system"
- "Write DS content for job scheduling application"

## Output Format
- **Type**: `string`
- **Success Example**: "# DS01 – Vision\n\n## Overview\n..."
- **Error Example**: "Error: Failed to generate DS content."

## Constraints
- DS files must focus on vision, goals, and high-level feature descriptions.
- No code or technical implementation details.
- Content must be global and strategic, not file-specific.
