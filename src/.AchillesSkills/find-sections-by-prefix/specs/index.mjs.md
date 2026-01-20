# Find Sections by Prefix Skill Specification

## Overview
This skill filters backlog sections by a prefix in the file key. It returns an array of file keys starting with the specified prefix. The skill returns the array upon success or throws errors for invalid parameters.

## Interface
- **Input**: A prompt string in the format `"backlog: specs|docs, prefix: string"`.
- **Output**: An array of file keys.

## Dependencies
- `BacklogManager` (for loading and filtering sections).