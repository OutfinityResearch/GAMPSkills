# Review Text Skill Specification

## Overview
This skill analyzes provided text for quality, gaps, or improvements based on specified criteria. It returns a feedback object with status and suggestions. The skill returns the feedback object upon success or throws errors for invalid parameters or invalid formats.

## Interface
- **Input**: A prompt string in the format `"content: text, criteria: text"`.
- **Output**: A feedback object.

## Dependencies
- LLM agent (for evaluation).