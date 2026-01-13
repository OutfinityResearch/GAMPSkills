# Review Docs Prompts

This module defines the prompt strategy for the documentation review process. It constructs the specific instructions sent to the Large Language Model (LLM).

## Functionality

The module exports a single function `buildReviewPrompt` which takes an object containing:
-   `docsMap`: A dictionary where keys are relative file paths and values are the raw string content of the documentation files.

## Prompt Structure

The generated prompt includes:
1.  **Role Definition**: Sets the AI persona as an "expert technical writer and documentation auditor".
2.  **Constraint**: Explicitly instructs the AI to **NOT** check against source code.
3.  **Content Aggregation**: Iterates through the `docsMap` and appends all documentation files into a single context block, separated by clear file headers.
4.  **Checklist**: A specific list of criteria to evaluate:
    -   Clarity and flow.
    -   Broken internal logic or contradictions *between* documents.
    -   Completeness (missing sections).
    -   Formatting and structural consistency.
    -   Terminology consistency.
5.  **Output Format**: Enforces a strict JSON response schema where the keys map to the input file paths and the values contain the evaluation details (`description`, `status`, `issues`, `proposedFixes`).
