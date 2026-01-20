# Append Section Skill Specification

## Overview
This skill adds a new section to the backlog if it does not already exist, using the specified initial content. It returns the updated sections object. The skill returns the sections object upon success or throws errors for invalid parameters.

## Interface
- **Input**: A prompt string in the format `"backlog: specs|docs, fileKey: key, content: initial content"`.
- **Output**: The updated sections object.

## Dependencies
- `BacklogManager` (for loading and appending sections).