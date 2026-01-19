# Review Specs Technical Specification

## Overview
This module implements the `review-specs` skill. Its purpose is to analyze existing specification files for gaps, inconsistencies, and errors. It logs its findings in the `specs_backlog.md` file, serving as a gatekeeper for quality control. It reviews all files under `./docs/specs`.

## File Location
`src/.AchillesSkills/review-specs/review-specs.mjs`

## Interface
The module must export a single asynchronous function named `action`.

```javascript
export async function action(context)
```

The function accepts a `context` object containing:
- **`prompt`** (string): Optional user focus (e.g., "Check for security gaps").
- **`llmAgent`** (object): Exposes `executePrompt`.

Returns a string summarizing the actions performed, such as "Reviewed X files, found Y issues. Backlog updated."

## Logic Flow

### 1. File Discovery
The module scans `./docs/specs` recursively to find all `.md` files (Global Specs, Local Specs in `src/`, Test Specs in `tests/`). It excludes `specs_backlog.md` itself if present in that tree (though it should be at root).

### 2. Analysis (LLM)
For each file (or batched if small), the module constructs a prompt:
- **Input**: File content + User prompt context.
- **Task**: Identify gaps, inconsistencies, or errors.
- **Output**: A structured JSON object or strict format containing:
  - `status`: "ok" or "needs_work"
  - `issues`: Text description of problems.
  - `options`: Proposed solutions/options.
- **Execution Mode**: The LLM must be invoked with `mode: 'deep'`.

### 3. Backlog Update
The module uses `BacklogManager.loadBacklog(BacklogManager.SPECS_BACKLOG)` to read the backlog. For each reviewed file:
- It uses `BacklogManager.getSection(BacklogManager.SPECS_BACKLOG, sectionName)` to locate the corresponding section (by filename). If missing, it uses `BacklogManager.appendSection(BacklogManager.SPECS_BACKLOG, sectionName, newContent)` to add a new section.
- It uses `BacklogManager.setStatus(BacklogManager.SPECS_BACKLOG, sectionName, 'needs_work')` if issues were found, or `'ok'` if clean.
- It uses `BacklogManager.updateSection(BacklogManager.SPECS_BACKLOG, sectionName, updatedContent)` to overwrite/append the `Issues` and `Options` fields with the LLM's findings.
- It clears the `Resolution` field (forcing user re-approval for new issues) via the same update method.

## Dependencies
- `node:fs`
- `node:path`
- `BacklogManager` module (uses `loadBacklog`, `getSection`, `appendSection`, `setStatus`, `updateSection`)

## Error Handling
- detailed error logging if a file cannot be read.
- validation of LLM output format before writing to backlog.
