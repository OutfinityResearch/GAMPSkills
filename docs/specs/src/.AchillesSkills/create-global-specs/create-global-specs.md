# Create Global Specs Technical Specification

## Overview
This module implements the `create-global-specs` skill, responsible for generating the high-level Global Functional Design Specifications (FDS) for a project. It synthesizes a user prompt with approved items from the project backlog to produce or update files like `FDS01-Vision.md`, `FDS07-Workflow.md`, etc., which reside in `./docs/specs`. It also updates the backlog status for processed items.

## File Location
`src/.AchillesSkills/create-global-specs/create-global-specs.mjs`

## Interface
The module must export a single asynchronous function named `action`.

```javascript
export async function action(context)
```

The function accepts a `context` object containing three required properties. The `prompt` property is a string containing the user's additional input or context. The `llmAgent` property is an object instance provided by the orchestrator that must expose an `executePrompt(prompt, options)` method. The `workingDir` property is a string containing the absolute path to the project root directory.

The function returns an object detailing the operation's result:

```javascript
{
  success: boolean,
  filesWritten: string[],
  backlogUpdated: boolean,
  targetDirectory: string
}
```

## Logic Flow

### 1. Input Validation
The module verifies that `llmAgent` exists and has an `executePrompt` method, and that `workingDir` is a valid path. `prompt` is optional but recommended; if empty, the backlog drives the generation.

### 2. Context Retrieval
The module reads the `specs_backlog.md` file from the project root. It parses this file to find sections relevant to Global Specifications (files typically named `FDSXX-*.md`). Specifically, it extracts the content of the `Resolution` sub-section for each global spec entry. If the `Resolution` contains valid text (non-whitespace), it is considered "approved" and prioritized for generation.

### 3. LLM Prompt Construction
The prompt for the LLM is constructed by combining:
- The user's input `prompt`.
- The extracted `Resolution` content from the backlog (representing approved architectural decisions).
- A list of existing Global Spec files in `./docs/specs` (to avoid duplicates or contradictions, though overwriting is allowed).
- Instructions to generate high-level FDS content (Vision, Scope, Audience, Components, Workflow).
- **Mandatory Output Format**: The LLM must delimit each file with `<!-- FILE: FDSxx-Name.md -->` markers. The filenames is decided by the LLM based on the content (e.g., `FDS01-Vision.md`).

### 4. LLM Execution
The module executes the prompt using `llmAgent.executePrompt` with `mode: 'deep'`.

### 5. File Parsing and Writing
The response is parsed for `<!-- FILE: ... -->` blocks. Each extracted file content is written to `./docs/specs/` (excluding `src/` or `tests/` subfolders). Existing files are overwritten.

### 6. Backlog Update
After successfully writing the files, the module updates `specs_backlog.md`. For every Global Spec section that was involved in the generation (i.e., those that had a `Resolution` used as input), the module updates its `Status` field to `ok`. This operation uses regex or string replacement to modify the backlog file in place, ensuring traceability.

## Dependencies
- `node:fs` - For reading the backlog and writing spec files.
- `node:path` - For path resolution.
- `BacklogManager` concepts (implemented via direct file manipulation or helper if available, but primarily string parsing here).

## Error Handling
- Throws errors if `specs_backlog.md` is missing or unreadable.
- Throws errors if the LLM response is malformed (no file markers).
- Handles write permissions and path errors gracefully.
