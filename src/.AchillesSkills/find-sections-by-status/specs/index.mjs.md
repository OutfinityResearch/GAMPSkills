# Find Sections by Status Skill Specification

## Overview
This skill filters backlog sections by the Status field value. It returns an array of file keys with the specified status. The skill returns the array upon success or throws errors for invalid parameters.

## Interface
- **Input**: A prompt string in the format `"backlog: specs|docs, status: ok|needs_work|blocked"`.
- **Output**: An array of file keys.

## Dependencies
- `BacklogManager` (for loading and filtering sections).