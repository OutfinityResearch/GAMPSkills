# Prompts Module Specification

## Purpose
Constructs LLM prompts for file selection and parses LLM responses. Injects active constraints into prompts.

## Dependencies
- `llmAgent` (passed in)
  - `executePrompt(prompt: string, options: { mode: 'fast', responseShape: 'json' }) -> Promise<object | string>`

## Public Exports
- `askLLMForFiles(llmAgent: object, userRequest: string, directoryTree: string, currentContext: string | null, constraints: string) -> Promise<{ done: boolean, files: string[], reason: string }>`
- `buildConstraintsSection(options: object) -> string`

## `askLLMForFiles`
Builds the prompt, calls the LLM, and normalizes the response.

Signature:
```
askLLMForFiles(llmAgent: object, userRequest: string, directoryTree: string, currentContext: string | null, constraints: string) -> Promise<{ done: boolean, files: string[], reason: string }>
```

Parameters:
- `llmAgent`: LLM agent with `executePrompt`
- `userRequest`: user prompt
- `directoryTree`: tree listing string
- `currentContext`: existing context assigns or null
- `constraints`: constraints text or empty string

Returns:
- `{ done, files, reason }` normalized

Flow:
1. Choose prompt builder: `buildFollowUpPrompt` if `currentContext` is truthy, else `buildInitialPrompt`
2. Call `llmAgent.executePrompt(prompt, { mode: 'fast', responseShape: 'json' })`
3. Parse response via `parseResponse(response)`
4. Return normalized `{ done, files, reason }`

## LLM Call Signature (Must Match Exactly)
```javascript
llmAgent.executePrompt(prompt, { mode: 'fast', responseShape: 'json' })
```

## `buildConstraintsSection(options)`
Builds an `## Active Constraints` section from options.

Signature:
```
buildConstraintsSection(options: object) -> string
```

Rules:
- `options.filter` → "ONLY select files whose name matches the pattern: ..."
- `options.exclude` → "Do NOT select files whose name matches the pattern: ..."
- `options.maxFiles` → "Maximum N files can be read in total. Be selective."
- `options.include` → "The following files are already force-included and loaded. Do NOT request them again: ..."
- `options.dir !== '.'` → "Only select files within the directory: ..."
- Returns empty string if no constraints are active

## Internal Functions
- `buildInitialPrompt(userRequest, directoryTree, constraints)`
- `buildFollowUpPrompt(userRequest, directoryTree, currentContext, constraints)`
- `parseResponse(response)`
- `normalizeResponse(obj)`

## `parseResponse(response)` Logic
1. If `response` is object (non-null) → `normalizeResponse(response)`
2. If `response` is string → try regex `\{[\s\S]*\}` to extract JSON, parse, normalize
3. Fallback → `{ done: true, files: [], reason: 'Could not parse LLM response.' }`

## `normalizeResponse(obj)` Logic
- `done`: coerced to `Boolean(obj.done)`
- `files`: filtered to non-empty strings from `obj.files` array
- `reason`: coerced to string, default `''`

## Code Generation Guidelines
- Constraints section is inserted between directory tree and instructions in both prompts
- Prompts must instruct LLM to respond ONLY with JSON (no markdown wrapping)
- Response parsing must handle both object and string responses robustly
- Mode must be 'fast', responseShape must be 'json'
