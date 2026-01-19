# Create Source Specs Technical Specification

## Overview
This module implements the `create-src-specs` skill, responsible for generating detailed technical functional design specifications (FDS) for source code. It takes a high-level user prompt and existing global project specifications, uses an LLM to generate technical details, and writes the resulting markdown files to the `./docs/specs/src/` directory.

## File Location
`src/.AchillesSkills/create-src-specs/create-src-specs.mjs`

## Interface
The module must export a single asynchronous function named `action`.

```javascript
export async function action(context)
```

The function accepts a `context` object containing two required properties. The `prompt` property is a string containing the user's description of the functionality or features to specify. The `llmAgent` property is an object instance provided by the orchestrator that must expose an `executePrompt(prompt, options)` method.

The function returns a string summarizing the actions performed, such as "Generated X files: [list of relative paths]."

## Logic Flow

### 1. Input Validation
The module begins by verifying inputs. It ensures that `prompt` is a non-empty string and that `llmAgent` exists and possesses an `executePrompt` function. If any validation fails, the module throws a detailed error.

### 2. Global Specs Context Retrieval
The system retrieves context from the global specs directory, resolved as `path.join(process.cwd(), 'docs/specs')`. It iterates through the immediate children of this directory to identify relevant specification files. The filter includes only files that end in `.md` and start with the prefix `FDS`. It explicitly excludes the `src` and `tests` subdirectories, as well as any files or directories starting with `.` (hidden files). The module then reads and stores the content of all qualifying files.

### 3. LLM Prompt Construction
The module constructs a prompt for the LLM that combines the original user request with the content of the global specification files. Each file's content is clearly delimited, for example using `### Filename` headers. The prompt includes specific instructions directing the LLM to generate detailed technical FDS files. These instructions mandate that the output must use `<!-- FILE: path/to/file.md -->` markers to separate files, and that all paths within these markers must be relative to `./docs/specs/src/`.

### 4. LLM Execution
The system invokes the `llmAgent.executePrompt` method with the constructed prompt. It passes options specifying `mode: 'deep'` to ensure thorough reasoning suitable for technical specifications. It also provides a context object `{ intent: 'generate-src-specs', skillName: 'create-src-specs' }`.

### 5. Response Parsing
Upon receiving the Markdown string from the LLM, the module parses it to extract file content. It uses a regular expression pattern like `/^<!--\s*FILE:\s*(.+?)\s*-->$/m` to identify file blocks. The content between these markers is extracted for writing. The module validates that at least one file has been successfully parsed; if the response format is invalid or yields no files, it throws an error.

### 6. File Generation
The module resolves the target directory as `path.join(process.cwd(), 'docs/specs/src')`. For each parsed file, the system sanitizes the relative path to prevent directory traversal and resolves the full destination path using the target directory. It recursively creates any necessary parent directories. Finally, it writes the content to the file, overwriting any existing version. The module operates immediately without a dry-run mode and does not create or update backlog files such as `specs_backlog.md`.

## Dependencies
The module relies on `node:fs` for all file system operations, including reading global specifications and writing the results. It uses `node:path` for path manipulation and resolution.

## Error Handling
The module throws errors in several specific scenarios. These include missing or invalid inputs, failures in the LLM execution or empty responses, file system permission issues, and malformed LLM responses that lack the required file markers.
