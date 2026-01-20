# Review Backlog Section Skill Specification

## Overview
This skill evaluates a backlog section for coherence and completeness using additional context. It returns a feedback object with issues and options. The skill returns the feedback object upon success or throws errors for invalid parameters or invalid formats.

## Interface
- **Input**: A prompt string in the format `"section: {...}, context: text"`.
- **Output**: A feedback object.

## Dependencies
- LLM agent (for analysis).
- `BacklogManager` (for section structure).