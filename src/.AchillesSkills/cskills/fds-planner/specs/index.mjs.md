# FDS Planner Skill - Implementation Specification

## Purpose
The fds-planner skill produces a plan for all intended FDS files and their dependencies. It returns a plain text list of file paths and dependency links that can be used as the source of truth for later FDS generation.

## Capabilities

### Planning Output
- Lists all intended FDS file paths under `./docs/specs/src`
- Captures dependencies between files as import paths
- Produces a plain text list suitable for downstream parsing

## Input Contract
- Has context object has input from which you need to extract `promptText` and `llmAgent`.

## Output Contract
- Returns a trimmed string response from the LLM
- Throws Error if prompt or llmAgent missing
- Returns `undefined` if no prompt could be resolved from inputs

## Implementation Details

### Prompt Construction
The skill constructs a planning prompt that:
1. Defines the goal (plan FDS files and dependencies)
2. Specifies a strict plain-text output format
3. Embeds the user's original prompt

#### Hardcoded Prompt Template (Must Match Exactly)
```
You are an FDS planning assistant.

Your task is to plan the File Design Specifications (FDS) set.
List all intended FDS file paths under "./docs/specs/src" and the dependencies between them.

Output rules:
- Return a plain text list, one file per line.
- Format each line as: <path> | depends: <comma-separated paths>.
- If a file has no dependencies, use: depends: none.
- Use only file paths, no extra commentary or headings.

User Prompt:
"""
${userPrompt}
"""
```

Rules:
- The template must be used verbatim, with no edits, rewording, or reordering.
- Only `${userPrompt}` is substituted with the resolved prompt text.

### LLM Interaction
- Uses `llmAgent.executePrompt()` with `mode: 'deep'`
- Returns trimmed response text

### LLM Call (Hardcoded Signature)
Call signature (must match exactly):
`llmAgent.executePrompt(plannerPrompt, { mode: 'deep' })`

- `plannerPrompt` is built by `buildPlannerPrompt(userPrompt)`
- Expected return: string; otherwise throw `fds-planner: llmAgent.executePrompt must return a string.`

## Dependencies
- None (pure delegation to llmAgent)

## Code Generation Guidelines
When regenerating this skill:
1. Validate prompt and llmAgent presence
2. Construct the planning prompt exactly as specified
3. Embed the user's prompt within the technical context
4. Use mode: 'deep' for LLM execution
5. Return trimmed response
