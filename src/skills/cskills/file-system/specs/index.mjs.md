# File System Skill - Implementation Specification

## Purpose
Provides a set of file system operations for the Achilles agent. It parses a command string and routes it to the appropriate operation.

## Dependencies (Explicit Paths)
- `fs/promises`
- `fs`
- `path`
- `../../../../utils/ArgumentResolver.mjs`
  - `extractArgumentsWithLLM`
  - `stripDependsOn`
- `../../../../utils/optionsParser.mjs`
  - `parseKeyValueOptionsWithMultiline(text: string, config: { allowedKeys: Set<string>, multilineKeys?: Set<string> }) -> object`

## Public Exports
- `action(context: { llmAgent: object, promptText: string }) -> Promise<string>`

## Supported Operations
- `readFile`
- `writeFile`
- `appendFile`
- `deleteFile`
- `createDirectory`
- `listDirectory`
- `fileExists`
- `copyFile`
- `moveFile`

## `action(context)`
Parses the command, extracts options, and executes the operation.

Signature:
```
action(context: { llmAgent: object, promptText: string }) -> Promise<string>
```

Parameters:
- `context.llmAgent`: LLM agent (used only as a fallback for options parsing)
- `context.promptText`: input string, required

Returns:
- A string for all operations (for non-strings, JSON stringification is applied)

Throws:
- `Error('No input provided for file-system operation')` if `promptText` is missing
- `Error('Invalid input: operation and path are required and must be valid.')` for invalid operation/path
- Operation-specific errors from the underlying fs calls

Parsing behavior:
- Strips `dependsOn:` suffix via `stripDependsOn()`
- Tokens are split by whitespace; `operation` is the first token, `path` is the second
- Options are parsed only if an `options:` marker exists
- Options parser accepts `content` and `destination` keys; `content` may be multiline
- If options parsing fails and `llmAgent.complete` exists, falls back to `extractArgumentsWithLLM`

### LLM Fallback for Options Parsing
Triggered only when `parseKeyValueOptionsWithMultiline` throws for `options:`.

Call signature (must match exactly):
```
extractArgumentsWithLLM(
  llmAgent,
  optionsRaw,
  'Extract file system operation options as key-value pairs.',
  ['content', 'destination']
)
```

Expected return:
- Array `[content, destination]`, otherwise throws `Error('Invalid options: unable to parse.')`

## Internal Functions
- `executeFileOperation({ operation, path, content, destination }) -> Promise<string | object>`

## `executeFileOperation` Behavior
Routes to the concrete file system operation and returns success messages.

### Operation Details
- `readFile`: reads UTF-8 and returns `FILE_CONTENT:\n<content>`
- `writeFile`: creates parent directories, writes UTF-8, returns success string
- `appendFile`: appends UTF-8, returns success string
- `deleteFile`: deletes file, returns success string
- `createDirectory`: mkdir recursive, returns success string
- `listDirectory`: returns success string with JSON list of entries
- `fileExists`: uses `existsSync`, returns success string with boolean
- `copyFile`: requires `destination`, copies file, returns success string
- `moveFile`: requires `destination`, renames file, returns success string

All paths are resolved with `resolve()` before operations are executed.

## Code Generation Guidelines
- Keep the switch-case routing structure
- Validate required parameters before executing
- Use `resolve()` for all path operations
- Create parent directories for `writeFile`
- Keep error messages consistent with the current implementation
