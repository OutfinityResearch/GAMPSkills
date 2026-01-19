# Fix Docs Technical Specification

## Overview
This module implements the `fix-docs` skill. It applies user-approved resolutions from `docs_backlog.md` to the HTML documentation files.

## File Location
`src/.AchillesSkills/fix-docs/fix-docs.mjs`

## Interface
The module must export a single asynchronous function named `action`.

```javascript
export async function action(context)
```

The function accepts a `context` object containing:
- **`prompt`** (string): Optional.
- **`llmAgent`** (object): Exposes `executePrompt`.

Returns a string summarizing the actions performed, such as "Fixed X documentation files. Backlog updated."

## Logic Flow

### 1. Backlog Parsing
The module reads `docs_backlog.md`. It identifies sections where `Resolution` is non-empty.

### 2. File Processing
For each approved item:
- Read current HTML file.
- Construct LLM Prompt:
  - Input: HTML content + `Resolution`.
  - Instruction: "Apply the resolution to the HTML. Return full updated HTML."
- Execute LLM using `mode: 'deep'`.
- Write updated HTML to `./docs/...`.

### 3. Backlog Update
Updates `docs_backlog.md`:
- Sets `Status` to `ok`.
- Clears `Issues`, `Options`, `Resolution`.

## Dependencies
- `node:fs`
- `node:path`

## Error Handling
- Validates that the output is HTML before writing.
