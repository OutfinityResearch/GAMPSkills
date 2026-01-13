# Review Docs Orchestrator Module

This module orchestrates the review of HTML documentation files within a target directory. It discovers documentation, aggregates it, invokes an LLM agent to analyze it for quality and consistency, and updates a backlog file with the results.

## Workflow

1.  **Input Parsing**:
    - Accepts a `targetDir` string (relative or absolute path).
    - Validates that the input is a non-empty string.
    - Resolves the path to an absolute path.
    - Verifies that the directory exists.

2.  **Doc Discovery**:
    - Scans the `docs/` subdirectory within the `targetDir`.
    - Recursively finds all files ending in `.html`.

3.  **Doc Evaluation**:
    - Reads the content of all discovered documentation files.
    - Aggregates the content of all files into a single map (path -> content).
    - Generates a single, comprehensive prompt for the LLM containing all documentation content.
    - Invokes the `llmAgent` with the generated prompt, expecting a JSON response.
    - The JSON response is expected to be a map of file paths to their individual evaluations.
    - Normalizes the LLM response to ensure every discovered file has a corresponding entry with `status`, `issues`, and `proposedFixes` fields.
    - Handles execution errors by marking all files as `needs-info`.

4.  **Backlog Management**:
    - Reads the existing `docs/docs_backlog.md` file (if present).
    - Merges the new evaluation results with the existing backlog content.
    - Preserves existing manual entries in the backlog while updating automated sections.
    - Sorts the backlog entries by file path.
    - Writes the updated content back to `docs/docs_backlog.md`.

5.  **Output**:
    - Returns a summary string indicating how many documentation files were processed and confirming the update of the backlog file.

## Dependencies

-   `fs/promises`: For file system operations (read, write, access, readdir, mkdir).
-   `path`: For path manipulation (join, relative, resolve).
-   `prompts.mjs`: Local module exporting `buildReviewPrompt` to construct the LLM input.
