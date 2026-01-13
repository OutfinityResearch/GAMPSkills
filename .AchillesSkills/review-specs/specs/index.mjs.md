# Review Specs Orchestrator Module

This module orchestrates the review of specification files within a target directory. It is responsible for discovering spec files, invoking an LLM agent to analyze them for quality and consistency, and updating a backlog file with the results.

## Workflow

1.  **Input Parsing**:
    - Accepts a `targetDir` string (relative or absolute path).
    - Validates that the input is a non-empty string.
    - Resolves the path to an absolute path.
    - Verifies that the directory exists.

2.  **Spec Discovery**:
    - Scans the `specs/` subdirectory within the `targetDir`.
    - Recursively finds all files ending in `.js.md` (embedded specs) or `.md` (standalone specs).
    - Sorts files alphabetically by their relative path.

3.  **Spec Evaluation**:
    - Iterates through each discovered spec file.
    - Reads the content of the file.
    - Generates a prompt for the LLM using the file content and its relative path.
    - Invokes the `llmAgent` with the generated prompt, expecting a JSON response.
    - Normalizes the LLM response to ensure it contains valid `status`, `issues`, and `proposedFixes` fields.
    - Handles any errors during evaluation by marking the status as `needs-info`.

4.  **Backlog Management**:
    - Reads the existing `docs/specs_backlog.md` file (if present).
    - Merges the new evaluation results with the existing backlog content.
    - Preserves existing manual entries in the backlog while updating automated sections.
    - Sorts the backlog entries by file path.
    - Writes the updated content back to `docs/specs_backlog.md`.

5.  **Output**:
    - Returns a summary string indicating how many specs were processed and confirming the update of the backlog file.

## Dependencies

-   `fs/promises`: For file system operations (read, write, access, readdir, mkdir).
-   `path`: For path manipulation (join, relative, resolve).
-   `prompts.mjs`: Local module exporting `buildReviewPrompt` to construct the LLM input.
