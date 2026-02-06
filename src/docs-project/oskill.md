# docs-project

## Description
The docs-project skill generates user-facing HTML documentation based on the existing codebase and user prompts. It creates structured content, navigation, and basic styling for documentation pages, placing them in the project's docs directory while preserving existing relevant files.

## Instructions
The LLM examines the project's source code and incorporates user instructions to craft informative documentation that explains the system's functionality and usage. It organizes the content into logical sections with clear navigation and appropriate formatting. The process involves synthesizing code insights with user requirements, potentially evaluating the documentation for usability and completeness before finalizing the output to ensure it serves the intended audience effectively.

## Allowed Skills
- scan-directory
- read-file
- generate-text
- review-text
- iterate-on-feedback
- parse-file-markers
- write-file