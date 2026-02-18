# Backlog Expert Skill - Implementation Specification

## Purpose
The backlog-expert skill generates backlog-ready content that can be written directly into backlog files. It focuses on producing tasks, task options, or short resolution/update text with strict output formatting to keep downstream parsing reliable.

## Capabilities

### Content Generation
- Generates backlog tasks as numbered lines
- Generates task options as numbered lines
- Produces short resolution/update text when requested
- Returns concise content with no extra prose or headings

### Backlog Characteristics
- **Parse-Friendly**: Numbered lines for tasks/options
- **Minimal**: No commentary or headings
- **Direct**: Output is ready to be inserted into backlog files

## Input Contract
- Has context object input from which you need to extract `promptText` and `llmAgent`.

## Output Contract
- Returns a trimmed string response from the LLM
- Throws Error if `llmAgent.executePrompt` does not return a string

## Implementation Details

### Technical Prompt Construction
The skill constructs a backlog-specific prompt that:
1. Defines the output formats for tasks and options
2. Enforces numbered-only lines for tasks/options
3. Allows concise text for resolutions/updates
4. Embeds the user's original prompt

#### Hardcoded Prompt Template (Must Match Exactly)
```
You are a backlog expert. Your job is to generate content that can be written in files of type backlog.
   A backlog is split into tasks, each task has a description, a list of options that represent the possible solutions to that task and a resolution field. 
   The resolution is the approved option that will be used to fulfill that task.
   Your output is written directly into backlog files.

Behaviors:
- If the user asks to generate backlog tasks, output ONLY numbered lines with tasks descriptions (e.g., "1. ...", "2. ...", "3. ...") with no extra prose or headings. In the task description you must mention the exact specs files which would be affected by this task.
- If the user asks to generate options for a task, output ONLY numbered lines (e.g., "1. ...", "2. ...", "3. ...") with no extra prose or headings.
- If the user asks for a resolution or a single update text, respond with a concise plain-text sentence or short paragraph only.
- Do not add commentary, analysis, or headings.

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
`llmAgent.executePrompt(expertPrompt, { mode: 'deep' })`

- `expertPrompt` is built by `buildBacklogExpertPrompt(userPrompt)`
- Expected return: string; otherwise throw `backlog-expert: llmAgent.executePrompt must return a string.`

### Content Guidelines Enforced
- Tasks and options must be numbered lines only
- Resolutions/updates must be concise plain text
- No headings, commentary, or analysis

## Dependencies
- None (pure delegation to llmAgent)

## Code Generation Guidelines
When regenerating this skill:
1. Validate prompt and llmAgent presence
2. Construct the exact hardcoded prompt template above
3. Embed user prompt within the template
4. Use mode: 'deep' for LLM execution
5. Return trimmed response
6. Keep implementation minimal - focus on prompt engineering
