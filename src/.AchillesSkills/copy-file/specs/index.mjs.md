# Copy File Skill Specification

## Overview
This skill copies a file from a source path to a destination path. It ensures the destination directory exists by creating it recursively if necessary. If the destination file already exists, it is overwritten. The skill returns a confirmation message upon success or throws errors for invalid paths or insufficient permissions.

## Interface
- **Input**: A prompt string in the format `"source: /source/path, dest: /destination/path"`.
- **Output**: A string message indicating success.

## Dependencies
- `node:fs` (for file copying and directory creation).
- `node:path` (for path manipulation).