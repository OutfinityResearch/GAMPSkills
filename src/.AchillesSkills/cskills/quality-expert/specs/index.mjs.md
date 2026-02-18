# Quality Expert Skill - Implementation Specification

## Purpose
The quality-expert skill reviews and fixes the content of a single file based on a profile and supporting context. It returns updated file content when changes are needed, otherwise it returns the original content unchanged.

## Capabilities

### Review + Fix
- Reviews a single file using a profile-specific structure (ds/fds)
- Applies corrections for syntax, semantics, consistency, dependencies, and logic
- Honors additional review conditions included in the input context

### Output Behavior
- Always returns valid JSON from the LLM
- Returns updated content when changes are needed
- Returns an empty content marker when no changes are needed

## Input Contract
- Has context object has input from which you need to extract `promptText` and `llmAgent`.
- `promptText` is a single string containing all parameters:
  `fileContent: <content> profile: <ds|fds|docs|code> context: <context>`

## Output Contract
- Returns the updated file content if the LLM returns `{ "content": "..." }`
- Returns the original file content if the LLM returns `{ "content": "" }`
- Throws Error for unsupported profiles or invalid JSON

## Implementation Details

### Profile Prompt Selection
The skill selects a structure profile based on `profile`:
- `ds` uses the exported DS structure profile
- `fds` uses the exported FDS structure profile
- `docs` and `code` are TBD and must throw errors

### Review Prompt Construction
The skill constructs a prompt that:
1. Inserts the profile-specific prompt
2. Adds explicit review + fix instructions
3. Includes file content and context

#### Hardcoded Prompt Template (Must Match Exactly)
```
Structure profile:
<profile-specific structure guidance>

Review and, if needed, fix the file content using the structure defined by the selected profile above.
Check the file for section structure, internal consistency, logic, syntax conventions, and any file paths or dependencies referenced.
Also apply any additional review requirements included in the context.

You MUST return valid JSON only, with one of the following shapes:
- {"content":"<updated file content>"} if any change is required
- {"content":""} if no change is needed

File content:
${fileContent}

Context:
${context}
```

Rules:
- The profile prompt must be inserted verbatim.
- The review + fix instructions must be inserted verbatim.
- Only `${fileContent}` and `${context}` are substituted.

### LLM Interaction
- Uses `llmAgent.executePrompt()` with `mode: 'deep'`
- Expects a JSON string response

### LLM Call (Hardcoded Signature)
Call signature (must match exactly):
`llmAgent.executePrompt(reviewPrompt, { mode: 'deep' })`

- `reviewPrompt` is built by `buildReviewPrompt({ fileContent, profile, context })`
- Expected return: string; otherwise throw `quality-expert: llmAgent.executePrompt must return a string.`

### Content Guidelines Enforced
- Respect profile structure from DS/FDS prompt
- Apply corrections only when needed
- Preserve original content when no changes are required

## Dependencies
- DS expert prompt template export
- FDS expert prompt template export

## Code Generation Guidelines
When regenerating this skill:
1. Parse input string into fileContent/profile/context
2. Map profile to the correct prompt template
3. Append review + fix instructions
4. Use mode: 'deep' for LLM execution
5. Parse JSON response and return updated content or original content
