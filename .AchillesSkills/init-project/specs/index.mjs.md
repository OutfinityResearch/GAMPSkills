# Init Project Orchestrator Module

This module initializes a new JavaScript project structure and kickstarts the specification process using an LLM.

## Workflow

1.  **Input Parsing**:
    - Accepts a string input containing the `targetDir` and an optional `userPrompt` (project blueprint).
    - Splits the input: the first token is the target directory, the rest is the user's project description.
    - Resolves the target directory to an absolute path.

2.  **Directory Initialization**:
    - Checks if the target directory exists; creates it if it doesn't.
    - Creates a standard directory structure:
        - `docs/`
        - `docs/specs/`
        - `docs/gamp/`
        - `docs/specs/src/`
        - `docs/specs/tests/`

3.  **Project Assessment**:
    - Constructs a prompt for the LLM using the user's provided blueprint (or a generic request if empty).
    - Invokes the `llmAgent` to analyze the blueprint and identify missing details, questions, or clarifications needed to define a coherent project spec.
    - Expects a JSON response with `status`, `issues` (questions), and `proposedFixes` (missing info).

4.  **Backlog Generation**:
    - **Specs Backlog**: Writes the LLM's analysis (questions and missing info) to `docs/specs_backlog.m` under a `## project-questions` section.
    - **Docs Backlog**: Creates a placeholder `docs/docs_backlog` file for future documentation issues.

5.  **Output**:
    - Returns a summary string confirming the initialization of directories and the creation of the backlog files.

## Dependencies

-   `fs/promises`: For file system operations.
-   `path`: For path manipulation.
-   `prompts.mjs`: Local module exporting `buildInitPrompt`.
