# Save Backlog Skill Specification

## Overview
This skill writes the full sections object to a specified backlog file, serializing the data into markdown format. It returns a confirmation message upon success or throws errors for invalid parameters or insufficient permissions.

## Interface
- **Input**: A prompt string in the format `"backlog: specs|docs, sections: {...}"`.
- **Output**: A string message indicating success.

## Dependencies
- `BacklogManager` (for saving and formatting).