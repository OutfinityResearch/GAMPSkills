# Create Directories Skill Specification

## Overview
This skill creates a directory tree recursively based on an array of specified paths. It ensures all parent directories are created if they do not already exist. The skill returns a confirmation message upon success or throws errors for invalid paths or insufficient permissions.

## Interface
- **Input**: A prompt string in the format `"paths: /path1, /path2, ..."`.
- **Output**: A string message indicating success.

## Dependencies
- `node:fs` (for directory creation).