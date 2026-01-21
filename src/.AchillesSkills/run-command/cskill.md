# run-command
Executes a shell command and returns the results.

## Summary
Executes a shell command and returns the results.

## Input Format
- **command** (string): Command to execute.
- **cwd** (string, optional): Working directory for the command.

## Output Format
- **Type**: `object`
- **Success Example**: `{ "stdout": "ok", "stderr": "", "exitCode": 0 }`
- **Error Example**: `{ "stdout": "", "stderr": "command not found", "exitCode": 127 }`

## Constraints
- Capture stdout, stderr, and exit code.
