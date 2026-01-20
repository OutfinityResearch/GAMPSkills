# Find Approved Sections Skill Specification

## Overview
This skill identifies backlog sections with non-empty Resolution fields, indicating they are approved for action. It returns an array of file keys. The skill returns the array upon success or throws errors for invalid parameters.

## Interface
- **Input**: A prompt string in the format `"backlog: specs|docs"`.
- **Output**: An array of file keys.

## Dependencies
- `BacklogManager` (for loading and filtering sections).