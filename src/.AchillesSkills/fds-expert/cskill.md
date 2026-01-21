# fds-expert
Generates File Design Specification (FDS) content with technical implementation details.

## Summary
Generates File Design Specification (FDS) content with technical implementation details.

## Input Format
- **prompt** (string): User instructions for FDS content generation.
- **llmAgent** (object): LLM agent instance with executePrompt method.

## Output Format
- **Type**: `string`
- **Success Example**: "# ModuleName\n\n## Description\n...\n## Dependencies\n..."
- **Error Example**: "Error: Failed to generate FDS content."

## Constraints
- FDS files must be technical and implementation-focused.
- Include: Description, Dependencies, Functions/Methods, Exports, Implementation details.
- Content must enable code regeneration from specification.
