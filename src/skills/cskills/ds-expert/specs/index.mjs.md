# DS Expert Skill - Implementation Specification

## Purpose
Generates Design Specification (DS) content focused on high-level "what" and "why" for the given prompt.

## Dependencies (Explicit Paths)
- `node:fs/promises`
- `node:path`
- `node:url`
- `../../../../utils/ArgumentResolver.mjs`
  - `stripDependsOn`

## Public Exports
- `DS_STRUCTURE_PROFILE: string`
- `action(context: { llmAgent: object, promptText: string }) -> Promise<string>`

## `DS_STRUCTURE_PROFILE`
Loaded once from `DS_structure.md` in the same directory as the module.

## Input Contract
- Requires `context.promptText` and `context.llmAgent`
- The prompt is sanitized via `stripDependsOn(promptText)`

## Output Contract
- Returns trimmed DS content string
- Throws if `llmAgent.executePrompt` does not return a string

## Internal Functions
- `getDsExpertPromptTemplate(userPrompt: string) -> string`
- `buildTechnicalPrompt(userPrompt: string) -> string`
- `executeDSGeneration({ prompt: string, llmAgent: object }) -> Promise<string>`

## Prompt Template (Must Match Exactly)
```
You are a Design Specification (DS) expert.

Your task is to produce the content of a DS file based on the provided instructions. Follow the input precisely and do not add commentary outside the DS content.

Style requirements:
Write in professional, business-appropriate language using paragraphs only. Avoid bullet points and lists. Keep paragraphs concise. Focus on “why” and “what” for the current subject, not “how.”

DS file structure guidance:
${DS_STRUCTURE_PROFILE}

User Prompt:
"""
${userPrompt}
"""
```

## LLM Interaction
- Uses `llmAgent.executePrompt(technicalPrompt, { mode: 'deep' })`
- Returns trimmed response text

## Code Generation Guidelines
- Load `DS_structure.md` from the module directory
- Keep prompt template verbatim
- Always trim the LLM response
