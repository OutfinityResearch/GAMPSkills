# Review Docs Technical Specification

## Overview
This module implements the `review-docs` skill. It examines the generated HTML documentation files under `./docs` to ensure they accurately reflect the project state and quality standards. It records findings in `docs_backlog.md`.

## File Location
`src/.AchillesSkills/review-docs/review-docs.mjs`

## Interface
The module must export a single asynchronous function named `action`.

```javascript
export async function action(context)
```

The function accepts a `context` object containing:
- **`prompt`** (string): Optional focus.
- **`llmAgent`** (object): Exposes `executePrompt`.

Returns a string summarizing the actions performed, such as "Reviewed X HTML files, found Y issues. Backlog updated."

## Logic Flow

### 1. File Discovery
The module scans `./docs` for `.html` files. It strictly excludes the static spec-to-html converter script (identified by name, e.g., `spec-converter.js` or similar if HTML, otherwise ignores non-content HTMLs).

### 2. Analysis (LLM)
Similar to `review-specs`, it sends file content to the LLM to identify presentation issues, missing links, or content gaps. It must invoke the LLM using `mode: 'deep'`.

### 3. Backlog Update
Uses `BacklogManager.loadBacklog(BacklogManager.DOCS_BACKLOG)` to read the backlog. For each reviewed file:
- Uses `BacklogManager.getSection(BacklogManager.DOCS_BACKLOG, sectionName)` to locate the corresponding section. If missing, uses `BacklogManager.appendSection(BacklogManager.DOCS_BACKLOG, sectionName, newContent)` to create it.
- Uses `BacklogManager.setStatus(BacklogManager.DOCS_BACKLOG, sectionName, 'needs_work')` if issues found.
- Uses `BacklogManager.updateSection(BacklogManager.DOCS_BACKLOG, sectionName, updatedContent)` to update `Issues` and `Options`.
- Clears the `Resolution` field via the same update method.

## Dependencies
- `node:fs`
- `node:path`
- `BacklogManager` module (uses `loadBacklog`, `getSection`, `appendSection`, `setStatus`, `updateSection`)

## Error Handling
- Gracefully handles missing `./docs` directory.
- Logs errors for malformed HTML that might choke parsing (if any).
