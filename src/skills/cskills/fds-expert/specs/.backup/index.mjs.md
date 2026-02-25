# FDS Expert Skill - Implementation Specification

## Purpose
Generates File Design Specification (FDS) content with detailed technical implementation information, intended to be regeneration-ready for a single file.

## Dependencies (Explicit Paths)
- `node:fs/promises`
- `node:path`
- `node:url`
- `../../../../utils/ArgumentResolver.mjs`
  - `stripDependsOn`

## Public Exports
- `FDS_STRUCTURE_PROFILE: string`
- `action(context: { llmAgent: object, prompt?: string, input?: string, [key: string]: unknown }) -> Promise<string | null>`

## `FDS_STRUCTURE_PROFILE`
Loaded once from `FDS_structure.md` in the same directory as the module.

## Input Contract
The prompt is resolved from:
1. `context.prompt`
2. `context.input`
3. The first value in `Object.values(context)`

The resolved prompt is sanitized via `stripDependsOn()`.

## Output Contract
- Returns trimmed FDS content string
- Returns `null` if no prompt could be resolved
- Throws if `llmAgent.executePrompt` does not return a string

## Internal Functions
- `getFdsExpertPromptTemplate(userPrompt: string) -> string`
- `buildTechnicalPrompt(userPrompt: string) -> string`
- `executeFdsGeneration({ prompt: string, llmAgent: object }) -> Promise<string>`

## Prompt Template (Must Match Exactly)
```
You are a File Design Specification (FDS) expert.

Focus on a single code file. Provide implementation-focused, regeneration-ready details.
Do not include code or low-level implementation steps beyond FDS descriptions.

FDS file structure guidance:
${FDS_STRUCTURE_PROFILE}

Guidelines:
- Be technical and file-specific.
- No extra commentary outside the FDS.

User Prompt:
"""
${userPrompt}
"""
```

## LLM Interaction
- Uses `llmAgent.executePrompt(technicalPrompt, { mode: 'deep' })`
- Returns trimmed response text

## Code Generation Guidelines
- Load `FDS_structure.md` from the module directory
- Keep prompt template verbatim
- Return `null` when no prompt is resolved
