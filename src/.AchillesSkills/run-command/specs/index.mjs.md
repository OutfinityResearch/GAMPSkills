# Run Command Skill Specification

## Overview
This skill executes a shell command and returns stdout, stderr, and exit code. It allows specifying the working directory for execution. The skill returns an object with outputs and exit code upon success or throws errors for invalid commands or execution failures.

## Interface
- **Input**: A prompt string in the format `"command: cmd, cwd: /path"`.
- **Output**: An object `{ stdout, stderr, exitCode }`.

## Dependencies
- `node:child_process` (for command execution).