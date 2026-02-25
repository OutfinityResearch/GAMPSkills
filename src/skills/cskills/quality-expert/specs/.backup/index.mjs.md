# Quality Expert Skill - Implementation Specification

## Purpose
Reviews and fixes the content of a single file based on a selected profile and supporting context. Returns updated content when changes are needed, otherwise returns the original content unchanged.

## Dependencies (Explicit Paths)
- `../../../../utils/ArgumentResolver.mjs`
  - `stripDependsOn`
- `../ds-expert/src/index.mjs`
  - `DS_STRUCTURE_PROFILE`
- `../fds-expert/src/index.mjs`
  - `FDS_STRUCTURE_PROFILE`

## Public Exports
- `action(context: { llmAgent: object, promptText: string }) -> Promise<string>`

## Input Contract
`promptText` must contain all parameters in a single string:
```
fileContent: <content> profile: <ds|fds|docs|code> context: <context>
```

## Output Contract
- Returns updated content if the LLM returns `{ "content": "..." }`
- Returns the original file content if the LLM returns `{ "content": "" }`
- Throws errors for invalid input, unsupported profile, or invalid JSON

## Internal Functions
- `buildReviewPrompt({ fileContent, profile, context }) -> string`
- `getProfilePrompt(profile: string) -> string`
- `parseInput(rawInput: string) -> { fileContent: string, profile: string, context: string }`
- `executeQualityReview({ prompt: string, llmAgent: object }) -> Promise<string>`

## `getProfilePrompt(profile)`
Selects the structure profile string.

Behavior:
- `ds` → `DS_STRUCTURE_PROFILE`
- `fds` → `FDS_STRUCTURE_PROFILE`
- `docs` or `code` → throws `quality-expert: Unsupported profile "<profile>" (TBD).`
- otherwise → throws `quality-expert: Unknown profile "<profile>".`

## `parseInput(rawInput)`
Parses `fileContent`, `profile`, and `context` from a single string.

Signature:
```
parseInput(rawInput: string) -> { fileContent: string, profile: string, context: string }
```

Behavior:
- Trims input and validates presence
- Uses regex: `fileContent\s*:\s*([\s\S]*?)\s*profile\s*:\s*([\s\S]*?)\s*context\s*:\s*([\s\S]*)$`
- Throws descriptive errors if any field is missing

## `buildReviewPrompt({ fileContent, profile, context })`
Builds the LLM prompt by inserting the selected profile guidance and the file/context.

Template (must match exactly):
```
Review and, if needed, fix the file content using the structure defined by the selected profile above.
Check the file for section structure, internal consistency, logic, syntax conventions, and any file paths or dependencies referenced.
Also apply any additional review requirements included in the context.

Below is the defined structure:
${profilePrompt}

You MUST return valid JSON only, with one of the following shapes:
- {"content":"<updated file content>"} if any change is required
- {"content":""} if no change is needed

File content:
${fileContent}

Context:
${context}
```

## LLM Interaction
- Uses `llmAgent.executePrompt(reviewPrompt, { mode: 'deep' })`
- Expects a JSON string response
- Throws if response is not a string or not valid JSON

## Code Generation Guidelines
- Always parse and validate the input string before calling the LLM
- Preserve original file content when LLM returns empty content
- Keep the prompt template verbatim
