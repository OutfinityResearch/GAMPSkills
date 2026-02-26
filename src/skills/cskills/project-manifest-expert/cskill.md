# project-manifest-expert

## Summary
Generates and updates the root `AGENTS.md` project manifest based on natural language instructions. The skill reads the current `AGENTS.md` (if present), uses it as context for the LLM, then writes the new content back to the same path.

## Input Format
- **prompt** (string): Instructions in natural language describing what to add/change or how to create `AGENTS.md`.
- **dependsOn** (string, optional): Dependency markers to enforce ordering; ignored by this skill.

## Output Format
- **Type**: `string`
- **Success Example**: "# AGENTS\n\n## Overview\n..."
- **Error Example**: "Error: Failed to generate AGENTS.md content."

## Constraints
- The skill operates on `AGENTS.md` in the current working directory.
- The LLM response must be the complete file content, with no extra commentary.
- The skill writes the new content to disk before returning it.
