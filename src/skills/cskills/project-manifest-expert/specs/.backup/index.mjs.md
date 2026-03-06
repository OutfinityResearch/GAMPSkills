# Project Manifest Expert Skill - Implementation Specification

## Purpose
Generates and updates `AGENTS.md` at the project root by merging user instructions with any existing manifest content.

## Dependencies (Explicit Paths)
- `node:fs/promises`
- `node:path`
- `../../../../utils/ArgumentResolver.mjs`
  - `stripDependsOn`

## Public Exports
- `action(context: { llmAgent: object, promptText?: string, prompt?: string, input?: string }) -> Promise<string | null>`

## Input Contract
- Accepts prompt text from `context.promptText`, `context.prompt`, `context.input`, or the first extra argument value.
- The prompt is sanitized via `stripDependsOn`.
- If no prompt is provided after sanitization, the action returns `null`.

## Output Contract
- Returns the full `AGENTS.md` content as a string.
- Writes the generated content to disk before returning it.
- Throws if `llmAgent.executePrompt` does not return a string.

## File IO
- Reads `AGENTS.md` from `process.cwd()` if it exists; otherwise uses an empty string.
- Writes the new content to the same path.

## Internal Functions
- `buildManifestPrompt(userPrompt: string, existingContent: string) -> string`
- `readExistingManifest(manifestPath: string) -> Promise<string>`
- `executeManifestGeneration({ prompt: string, llmAgent: object, manifestPath: string }) -> Promise<string>`

## Prompt Template (Must Match Exactly)
```
You are a project manifest expert.

Your task is to produce the full content of the AGENTS.md file based on the provided instructions.
Return only the complete file content, with no extra commentary.

Existing AGENTS.md content:
"""
${existingContent || '(missing)'}
"""

User Instructions:
"""
${userPrompt}
"""
```

## LLM Interaction
- Uses `llmAgent.executePrompt(technicalPrompt, { mode: 'deep' })`
- Returns trimmed response text

## Code Generation Guidelines
- Keep prompt template verbatim
- Always trim the LLM response
- Write to disk before returning content
