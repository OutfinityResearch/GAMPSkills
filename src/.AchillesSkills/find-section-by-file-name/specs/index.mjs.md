# Find Section by File Name Skill Specification

## Overview
This skill finds a backlog section matching a filename suffix. It returns the file key or null if not found. The skill returns the key or null upon success or throws errors for invalid parameters.

## Interface
- **Input**: A prompt string in the format `"backlog: specs|docs, filename: name"`.
- **Output**: A file key string or null.

## Dependencies
- `BacklogManager` (for loading and searching sections).