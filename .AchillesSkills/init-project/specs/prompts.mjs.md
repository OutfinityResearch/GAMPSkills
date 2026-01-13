# Init Project Prompts

This module defines the prompt strategy for initializing a new project. It constructs the instructions sent to the Large Language Model (LLM) to assess the initial project blueprint.

## Functionality

The module exports a single function `buildInitPrompt` which takes:
-   `userPrompt`: A string containing the user's initial description or blueprint of the project.

## Prompt Structure

The generated prompt includes:
1.  **Role Definition**: Sets the AI persona as an "expert project manager and specification auditor".
2.  **Goal**: Instructs the AI to produce a concise set of questions and identify missing details required to define a coherent project specification.
3.  **Constraint**: Explicitly instructs the AI to **NOT** invent features but only ask for clarifications.
4.  **Context**: Includes the user's blueprint. If empty, it instructs the AI to ask general foundational questions for a JavaScript project.
5.  **Focus Areas**: Lists specific domains to probe:
    -   Goals and scope.
    -   User roles.
    -   Primary flows.
    -   Data model.
    -   Integrations.
    -   Non-functional requirements.
    -   Risks, timeline, and acceptance criteria.
6.  **Output Format**: Enforces a strict JSON response schema:
    -   `status`: "ok", "needs-info", or "broken".
    -   `issues`: Array of detailed questions.
    -   `proposedFixes`: Array of suggestions on what information to provide.
