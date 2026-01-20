# Update Section Status Skill Specification

## Overview
This skill sets the Status field of a backlog section to a new value. It returns the updated sections object. The skill returns the sections object upon success or throws errors for invalid parameters.

## Interface
- **Input**: A prompt string in the format `"backlog: specs|docs, fileKey: key, status: ok|needs_work|blocked"`.
- **Output**: The updated sections object.

## Dependencies
- `BacklogManager` (for loading and setting status).