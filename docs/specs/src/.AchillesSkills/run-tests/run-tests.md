# Run Tests Technical Specification

## Overview
This module implements the `run-tests` skill. It executes the project's test suite and reports results.

## File Location
`src/.AchillesSkills/run-tests/run-tests.mjs`

## Interface
The module must export a single asynchronous function named `action`.

```javascript
export async function action(context)
```

The function accepts a `context` object containing:
- **`prompt`** (string): Optional (unused by logic, but kept for consistency).
- **`llmAgent`** (object): (Unused, as this is deterministic, but kept for signature consistency).
- **`workingDir`** (string): Project root path.

Returns:
```javascript
{
  success: boolean,
  output: string,
  exitCode: number
}
```

## Logic Flow

### 1. Execution
The module executes the command `npm test` in the `workingDir`.

### 2. Output Capture
It captures `stdout` and `stderr`.

### 3. Reporting
It streams the output to the console for the user to see immediately.
It returns the full output and exit code in the result object.

## Dependencies
- `node:child_process` (exec or spawn)

## Error Handling
- Captures execution errors (e.g., command not found).
- Returns `success: false` if tests fail (non-zero exit code).
