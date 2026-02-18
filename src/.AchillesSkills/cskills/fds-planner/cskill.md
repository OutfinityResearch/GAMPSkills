# fds-planner

## Summary
Plans the File Design Specification (FDS) set by listing intended FDS file paths and their dependencies. Input is natural language; output is a plain text list.

## Input Format
- **prompt** (string): Instructions and context describing the project and existing specs.
- **dependsOn** (string, optional): Dependency markers to enforce ordering; ignored by this skill.

## Output Format
- **Type**: `string`
- **Success Example**: "./docs/specs/src/api/client.mjs.md | depends: ./docs/specs/src/core/http.mjs.md"
- **Error Example**: "Error: fds-planner: llmAgent.executePrompt must return a string."

## Constraints
- Output must be a plain text list, one file per line.
