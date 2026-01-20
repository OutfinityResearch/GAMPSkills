# Load Backlog Skill Specification

## Overview
This skill loads sections from a specified backlog file, parsing the content into structured data. It returns the sections object and metadata like modification time. The skill returns the object with sections and metadata upon success or throws errors for non-existent files or invalid formats.

## Interface
- **Input**: A prompt string in the format `"backlog: specs|docs"`.
- **Output**: An object `{ sections, metadata }`.

## Dependencies
- `BacklogManager` (for loading and parsing).