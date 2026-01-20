# Read File Skill Specification

## Overview
This skill reads the content of a file from a specified path and returns it as a UTF-8 encoded string. The skill returns the file content upon success or throws errors for invalid paths, non-existent files, or insufficient permissions.

## Interface
- **Input**: A prompt string in the format `"path: /absolute/path"`.
- **Output**: A string containing the file content.

## Dependencies
- `node:fs` (for file reading).