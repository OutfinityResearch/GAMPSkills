# Docs Project Technical Specification

## Overview
This module implements the `docs-project` skill. It generates user-facing HTML documentation based on the codebase and user prompts. It creates structure, content, and basic styling.

## File Location
`src/.AchillesSkills/docs-project/docs-project.mjs`

## Interface
The module must export a single asynchronous function named `action`.

```javascript
export async function action(context)
```

The function accepts a `context` object containing:
- **`prompt`** (string): Instructions (e.g., "Create API reference").
- **`llmAgent`** (object): Exposes `executePrompt`.

Returns a string summarizing the actions performed, such as "Generated X documentation files: [list]."

## Logic Flow

### 1. Codebase Scan
The module scans `./src` (and potentially other relevant folders) to understand the implemented system.

### 2. Planning (LLM)
It asks the LLM to propose a documentation structure (files to create: `index.html`, `api.html`, etc.) based on the code and user prompt. It uses `mode: 'deep'`.

### 3. Generation (LLM)
For each proposed file:
- Construct Prompt: Code summaries + File purpose.
- Task: "Generate full HTML5 content, including inline CSS for basic styling. No external JS required."
- Output: HTML content.
- Execution: Use `mode: 'deep'`.

### 4. Writing
Writes files to `./docs/`. Overwrites existing files if they match the generated names.

## Dependencies
- `node:fs`
- `node:path`

## Error Handling
- Ensure output is valid HTML structure.
