# Parse File Markers Skill Specification

## Overview
This skill extracts file contents from LLM output delimited by `<!-- FILE: path -->` markers. It returns an object mapping paths to their corresponding content. The skill returns the parsed object upon success or throws errors for invalid marker formats.

## Interface
- **Input**: A prompt string in the format `"content: string with markers"`.
- **Output**: An object `{ path: content }`.

## Dependencies
- None (uses standard regex).