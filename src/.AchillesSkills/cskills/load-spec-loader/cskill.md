# load-spec-loader

## Summary
Loads the bundled specsLoader.html asset and returns its content as a string.

## Input Format
- **prompt** (string, optional): Ignored by this skill.
- **dependsOn** (string, optional): Dependency markers to enforce ordering; ignored by this skill.

## Output Format
- **Type**: `string`
- **Success Example**: "<!DOCTYPE html>..."
- **Error Example**: "Error: Failed to load specsLoader.html."

## Constraints
- Does not call the LLM.
