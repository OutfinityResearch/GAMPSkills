# Backlog Expert Skill - Implementation Specification

## Purpose
Generates backlog-ready content (tasks, options, or short updates) with strict output formatting for downstream parsing.

## Dependencies (Explicit Paths)
- `../../../../utils/ArgumentResolver.mjs`
  - `stripDependsOn`

## Public Exports
- `action(context: { llmAgent: object, promptText: string }) -> Promise<string>`

## Input Contract
- Uses `context.promptText` and `context.llmAgent`
- Sanitizes prompt with `stripDependsOn(promptText)`

## Output Contract
- Returns a trimmed string response from the LLM
- Throws if `llmAgent.executePrompt` does not return a string

## Internal Functions
- `buildBacklogExpertPrompt(userPrompt: string) -> string`
- `executeBacklogExpert({ prompt: string, llmAgent: object }) -> Promise<string>`

## Prompt Template (Must Match Exactly)
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

## LLM Interaction
- Uses `llmAgent.executePrompt(expertPrompt, { mode: 'deep' })`
- Returns trimmed response text

## Code Generation Guidelines
- Keep the prompt template verbatim
- Always trim the LLM response
