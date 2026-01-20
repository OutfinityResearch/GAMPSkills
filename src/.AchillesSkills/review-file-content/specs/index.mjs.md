# Review File Content Skill Specification

## Overview
This skill analyzes file content for consistency and issues using additional context. It returns a feedback object with status and suggestions. The skill returns the feedback object upon success or throws errors for invalid parameters or invalid formats.

## Interface
- **Input**: A prompt string in the format `"path: /path, content: text, context: text"`.
- **Output**: A feedback object.

## Dependencies
- LLM agent (for analysis).
- `node:fs` (for file reading).