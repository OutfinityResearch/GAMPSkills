# Review Specs Skill - Implementation Specification

## Purpose
The review-specs skill analyzes specification content and returns a plain text review report. It performs a comprehensive review across syntax, semantics, consistency, and dependencies, prioritizing any review conditions included in the input.

## Capabilities

### Review Coverage
- Reviews specification content from all perspectives
- Prioritizes explicit review conditions included in the input
- Falls back to a general review when no specific review type is requested
- Detects syntax, structural, semantic, consistency, and dependency issues

### Output Behavior
- Returns a line-per-problem report with file paths and exact issue descriptions
- Returns a single affirmative response when no issues are detected
- Produces no extra commentary, headings, or code

## Input Contract
- Has context object has input from which you need to extract `promptText` and `llmAgent`.

## Output Contract
- Returns a trimmed string response from the LLM
- Throws Error if prompt or llmAgent missing
- Returns `undefined` if no prompt could be resolved from inputs

## Implementation Details

### Review Prompt Construction
The skill constructs a review prompt that:
1. Describes the reviewer's role and scope
2. Enforces priority of input-specific review conditions
3. Lists the types of issues to detect
4. Specifies a strict output format
5. Embeds the user's original prompt

#### Hardcoded Prompt Template (Must Match Exactly)
```
You are a specification reviewer.

Analyze the provided specification files content from all perspectives.
If the input includes extra review conditions or priorities, follow those first.
If no specific review type is requested, perform a general review.

Find any type of problems, including:
- Syntax or structural issues
- Semantic problems or incorrect statements
- Consistency issues within a file or across files
- Missing or invalid dependencies between files (including references to files not present in the input context)
- Any other gaps or contradictions

Output format:
- If problems are found, output one line per problem:
  <file_path> - <exact problem>
  Example: ./path/to/file - missing header that exists in other files; dependency ./dep/dep2 is not present in the provided context
- If no problems are found, output exactly: "No problems detected."

Do not include extra commentary, headings, or code.

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
`llmAgent.executePrompt(reviewPrompt, { mode: 'deep' })`

- `reviewPrompt` is built by `buildReviewPrompt(userPrompt)`
- Expected return: string; otherwise throw `review-specs: llmAgent.executePrompt must return a string.`

### Content Guidelines Enforced
- Honor input-specific review conditions first
- Provide a complete, cross-file review
- Report every issue as a file-scoped line item
- Return "No problems detected." when there are no issues

## Dependencies
- None (pure delegation to llmAgent)

## Code Generation Guidelines
When regenerating this skill:
1. Validate prompt and llmAgent presence
2. Construct the review prompt exactly as specified
3. Embed the user's prompt within the technical context
4. Use mode: 'deep' for LLM execution
5. Return trimmed response
6. Keep implementation minimal - focus on prompt engineering
