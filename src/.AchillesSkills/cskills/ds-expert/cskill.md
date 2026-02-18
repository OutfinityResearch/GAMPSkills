# ds-expert

## Summary
Generates Design Specification (DS) content for one file with global vision and high-level feature descriptions. Provide natural language instructions describing the project vision and requirements.

## Input Format
- **prompt** (string): Instructions in natural language for DS file content generation.
- **dependsOn** (string, optional): Dependency markers to enforce ordering; ignored by this skill.

## Output Format
- **Type**: `string`
- **Success Example**: "# DS01 – Vision\n\n## Overview\n..."
- **Error Example**: "Error: Failed to generate DS content."

## Constraints
- You may need to provide additional context in the prompt because ds-expert has no memory, it will not remember previous requests and results.
- DS files must focus on vision, goals, and high-level feature descriptions.
- No code or technical implementation details.
