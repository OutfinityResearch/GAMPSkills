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
Updates `./docs_backlog.md`:
- Locates/Creates section for the file.
- Sets `Status` to `needs_work` if issues found.
- Updates `Issues` and `Options`.
- Clears `Resolution`.

## Dependencies
- `node:fs`
- `node:path`

## Error Handling
- Gracefully handles missing `./docs` directory.
- Logs errors for malformed HTML that might choke parsing (if any).
