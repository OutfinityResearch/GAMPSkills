# Get Backlog Section Skill Specification

## Overview
This skill retrieves a specific section from the backlog by file key. It returns the section object or null if not found. The skill returns the section object or null upon success or throws errors for invalid parameters.

## Interface
- **Input**: A prompt string in the format `"backlog: specs|docs, fileKey: key"`.
- **Output**: A section object or null.

## Dependencies
- `BacklogManager` (for loading sections).