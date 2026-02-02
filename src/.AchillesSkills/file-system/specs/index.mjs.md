# File System Skill - Implementation Specification

## Purpose
The file-system skill provides comprehensive file system operations for the Achilles agent, enabling it to read, write, manipulate, and query files and directories within the project workspace.

## Capabilities

### File Operations
- **readFile**: Return a success string indicating the file path was read (does not return file contents)
- **writeFile**: Write content to file, creating parent directories if needed
- **appendFile**: Append content to existing file
- **deleteFile**: Remove file from filesystem
- **copyFile**: Copy file from source to destination path
- **moveFile**: Move/rename file from source to destination path

### Directory Operations
- **createDirectory**: Create directory with recursive parent creation
- **listDirectory**: List all entries in a directory

### Query Operations
- **fileExists**: Check if file or directory exists at given path

## Input Contract
The skill parses a single text command from `promptText`:

- First token: `operation`
- Second token: `path`
- Remaining text: payload for `content:` or `destination:`, or raw content for write/append

For `copyFile` and `moveFile`, the payload must be `destination: <path>`.
For `writeFile` and `appendFile`, the payload may be `content: <text>` or raw text after the path.

## Output Contract
- String messages for all successful operations, including `readFile`, `listDirectory`, and `fileExists`
- Throws Error with descriptive message on failure

## Implementation Details

### Path Resolution
- All paths are resolved with `path.resolve()`
- Parent directories are created automatically for `writeFile`
- Output messages use the resolved full path as printed string

### Error Handling
- Invalid operation or missing path triggers LLM argument extraction when possible
- Missing required parameters throw descriptive errors
- File system errors propagate with original error messages

### Regex Patterns (Hardcoded)
- First line split: `/\r?\n/`
- Token split: `/\s+/`
- Payload prefix checks:
  - Destination: `/^destination\s*:/i`
  - Content: `/^content\s*:/i`
- Operation trim: `/\s+/` (split on whitespace)

### LLM Fallback (Hardcoded Signature)
Triggered only when operation is not allowed or path is missing.

Call signature (must match exactly):
`extractArgumentsWithLLM(llmAgent, promptText, instructionText, ['operation', 'path', 'content', 'destination'])`

- `instructionText` must be: `Extract file system operation arguments. Allowed operations: <comma-separated allowedOperations>`
- Expected return: array in order `[operation, path, content, destination]`
- If return is not an array, throw `Unknown operation: ${operation}`

### Dependencies
- `fs/promises`: readFile, writeFile, appendFile, unlink, mkdir, readdir, stat, copyFile, rename
- `fs`: existsSync (synchronous check for exists operation)
- `path`: resolve, dirname

## Code Generation Guidelines
When regenerating this skill:
1. Maintain switch-case structure for operation routing
2. Keep all operations async
3. Validate required parameters at function entry
4. Use resolve() for all path operations
5. Create parent directories for write operations
6. Return consistent success messages or structured data
7. Throw errors with clear messages for invalid inputs
