# Review Specs Prompts

This module defines the prompt strategy for the specification review process. It constructs the specific instructions sent to the Large Language Model (LLM).

## Functionality

The module exports a single function `buildReviewPrompt` which takes an object containing:
-   `specContent`: The raw text content of the specification file.
-   `relativePath`: The path of the file being reviewed (for context).

## Prompt Structure

The generated prompt includes:
1.  **Role Definition**: Sets the AI persona as an "expert project manager and specification auditor".
2.  **Constraint**: Explicitly instructs the AI to **NOT** assume code exists and to evaluate the spec on its own merits.
3.  **Context**: Provides the file name and its full content.
4.  **Checklist**: A specific list of criteria to evaluate:
    -   Clarity of purpose and scope.
    -   Logical flow.
    -   Internal ambiguities or contradictions.
    -   Conceptual completeness (requirements, inputs/outputs, edge cases).
    -   Formatting and structure.
5.  **Output Format**: Enforces a strict JSON response schema:
    -   `status`: One of "ok", "needs-info", or "broken".
    -   `issues`: An array of strings describing specific problems.
    -   `proposedFixes`: An array of strings suggesting improvements.
