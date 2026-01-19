# Fix Specs Technical Specification

## Overview
This module implements the `fix-specs` skill. It applies user-approved resolutions from `specs_backlog.md` to the actual specification files. It acts as the "applier" of changes that have passed the backlog gate.

## File Location
`src/.AchillesSkills/fix-specs/fix-specs.mjs`

## Interface
The module must export a single asynchronous function named `action`.

```javascript
export async function action(context)
```

The function accepts a `context` object containing:
- **`prompt`** (string): Not typically used for content generation here, as the backlog drives it, but can be used for logging/filtering.
- **`llmAgent`** (object): Exposes `executePrompt`.

Returns a string summarizing the actions performed, such as "Fixed X specifications. Backlog updated."

## Logic Flow

### 1. Backlog Parsing
The module uses `BacklogManager.findApprovedItems(BacklogManager.SPECS_BACKLOG)` to identify file sections where the `Resolution` field contains non-whitespace text (considered "approved for fix").

### 2. File Processing (Loop)
For each approved file:
- Read the current content of the spec file (if it exists).
- Construct LLM Prompt:
  - Input: Current content + `Issues` + `Options` + `Resolution` (from backlog).
  - Instruction: "Apply the resolution to the file content. Return the full updated file."
- Execute LLM using `mode: 'deep'`.
- Write the updated content to the file path (Global, `src/`, or `tests/` depending on the section name/path).

### 3. Backlog Update
After applying the fix, the module uses `BacklogManager.setStatus(BacklogManager.SPECS_BACKLOG, sectionName, 'ok')` to set the `Status` to `ok` and `BacklogManager.updateSection(BacklogManager.SPECS_BACKLOG, sectionName, clearedContent)` to clear `Issues`, `Options`, and `Resolution` (resetting the cycle).

## Dependencies
- `node:fs`
- `node:path`
- `BacklogManager` module (uses `findApprovedItems`, `setStatus`, `updateSection`)

## Error Handling
- Checks if target file path is valid.
- Ensures LLM returns valid markdown before overwriting.
