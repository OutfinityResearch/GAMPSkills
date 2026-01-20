# Update Section Content Skill Specification

## Overview
This skill updates the Issues, Options, or Resolution fields of a backlog section with new data. It returns the updated sections object. The skill returns the sections object upon success or throws errors for invalid parameters.

## Interface
- **Input**: A prompt string in the format `"backlog: specs|docs, fileKey: key, updates: {...}"`.
- **Output**: The updated sections object.

## Dependencies
- `BacklogManager` (for loading and updating sections).