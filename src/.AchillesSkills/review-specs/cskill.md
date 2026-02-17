# review-specs

## Summary
Analyzes specification files and returns a review report. Provide the specs files content and any review instructions as input in natural language; the output is a plain text report.

## Input Format
- **prompt** (string): Specification content and context to review.
- **dependsOn** (string, optional): Dependency markers to enforce ordering; ignored by this skill.

## Output Format
- **Type**: `string`
- **Success Example**: "Issues found in DS02-Architecture.md: ..."
- **Error Example**: "Error: Failed to review specs."
