# Create Tests Specs Technical Specification

## Overview
This module implements the `create-tests-specs` skill. It generates test specifications in `./docs/specs/tests` describing assertions, expected inputs and outputs, and relevant scenarios. The structure of these files is not fixed; the LLM decides the appropriate file organization based on the project context.

## File Location
`src/.AchillesSkills/create-tests-specs/create-tests-specs.mjs`

## Interface
The module must export a single asynchronous function named `action`.

```javascript
export async function action(context)
```

The function accepts a `context` object containing:
- **`prompt`** (string): User instructions (e.g., "Focus on edge cases for auth").
- **`llmAgent`** (object): Exposes `executePrompt`.
- **`workingDir`** (string): Project root path.

Returns:
```javascript
{
  success: boolean,
  filesWritten: string[]
}
```

## Logic Flow

### 1. Context Retrieval
The module retrieves context from:
- **Global Specs**: Reads all `FDS*.md` files from `./docs/specs`.
- **Source Specs**: Reads all technical specs from `./docs/specs/src` (recursively).
This combined content provides the LLM with a complete picture of the system's intended behavior.

### 2. Generation (LLM)
The module constructs a single comprehensive prompt:
- **Input**: User prompt + Global Specs + Technical Specs.
- **Task**: "Analyze the specifications and design a test suite strategy. Generate detailed Test Specification files describing what should be tested (assertions, scenarios, edge cases). Do not write code."
- **Output Format**: The LLM must delimit each file with `<!-- FILE: path/to/file.md -->` markers. The paths should be relative to `./docs/specs/tests/`. The LLM has full autonomy to decide the file structure and naming.
- **Execution Mode**: The LLM must be invoked with `mode: 'deep'`.

### 3. Parsing and Writing
- The module parses the LLM response for `<!-- FILE: ... -->` blocks.
- It writes the content to the specified paths under `./docs/specs/tests/`, creating directories as needed.
- Existing files are overwritten.

## Dependencies
- `node:fs`
- `node:path`

## Error Handling
- Throw errors if the LLM response is empty or contains no file markers.
- Handle file system permission errors.
