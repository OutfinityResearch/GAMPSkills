# Iterate on Feedback Skill Specification

## Overview
This skill refines content based on a provided feedback object, applying suggestions in a single pass. It returns the revised content as a string. The skill returns the refined content upon success or throws errors for invalid parameters or LLM failures.

## Interface
- **Input**: A prompt string in the format `"content: text, feedback: {...}"`.
- **Output**: A string of revised content.

## Dependencies
- LLM agent (for content refinement).