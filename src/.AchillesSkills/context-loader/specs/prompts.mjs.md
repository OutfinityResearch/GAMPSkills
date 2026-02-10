# Prompts Module Specification

## Purpose
Constructs LLM prompts for file selection and parses LLM responses. Injects active constraints into prompts.

## Exports
- `askLLMForFiles(llmAgent, userRequest, directoryTree, currentContext, constraints)` → `Promise<{ done, files, reason }>`
- `buildConstraintsSection(options)` → `string`

## Dependencies
- None (pure functions + llmAgent passed as parameter)

## `askLLMForFiles` Flow
1. Choose prompt builder: `buildFollowUpPrompt` if `currentContext` is truthy, else `buildInitialPrompt`
2. Call `llmAgent.executePrompt(prompt, { mode: 'fast', responseShape: 'json' })`
3. Parse response via `parseResponse(response)`
4. Return normalized `{ done: boolean, files: string[], reason: string }`

## LLM Call Signature (Must Match Exactly)
```javascript
llmAgent.executePrompt(prompt, { mode: 'fast', responseShape: 'json' })
```

## `buildConstraintsSection(options)` Logic
Builds an `## Active Constraints` section from options:
- `options.filter` → "ONLY select files whose name matches the pattern: ..."
- `options.exclude` → "Do NOT select files whose name matches the pattern: ..."
- `options.maxFiles` → "Maximum N files can be read in total. Be selective."
- `options.include` → "The following files are already force-included and loaded. Do NOT request them again: ..."
- `options.dir !== '.'` → "Only select files within the directory: ..."
- Returns empty string if no constraints are active.

## Prompt Templates

### Initial Prompt Structure
```
Role: context-loading assistant
## Request: user request
## Project Directory Structure: tree text
## Active Constraints: (if any)
## Instructions: select relevant files (3-8), avoid binaries/locks, use exact paths
## Response Format: JSON { done, files, reason }
```

### Follow-Up Prompt Structure
```
Role: context-loading assistant (has already read some files)
## Original Request: user request
## Project Directory Structure: tree text
## Already Loaded Context: current context XML
## Active Constraints: (if any)
## Instructions: check imports/references, don't re-request, mark done if sufficient
## Response Format: JSON { done, files, reason }
```

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
