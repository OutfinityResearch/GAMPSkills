# Write File Skill Specification

## Overview
This skill writes or overwrites the content of a file at a specified path, creating parent directories if they do not exist. The skill returns a confirmation message upon success or throws errors for invalid paths or insufficient permissions.

## Interface
- **Input**: A prompt string in the format `"path: /absolute/path, content: file content"`.
- **Output**: A string message indicating success.

## Dependencies
- `node:fs` (for file writing and directory creation).
- `node:path` (for path manipulation).