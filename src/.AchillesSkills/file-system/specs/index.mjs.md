# File System Skill - Implementation Specification

## Purpose
The file-system skill provides comprehensive file system operations for the Achilles agent, enabling it to read, write, manipulate, and query files and directories within the project workspace.

## Capabilities

### File Operations
- **readFile**: Read complete file content as UTF-8 string
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
```javascript
{
  operation: string,      // Required: operation type
  path: string,          // Required: target path (relative to project root)
  content?: string,      // Optional: content for write/append
  destination?: string   // Optional: destination for copy/move
}
```

## Output Contract
- String messages for successful operations
- Arrays for listDirectory
- Objects for fileExists: `{ exists: boolean }`
- Throws Error with descriptive message on failure

## Implementation Details

### Path Resolution
- All paths are resolved relative to project root using `path.resolve()`
- Parent directories are created automatically for write operations

### Error Handling
- Invalid operation throws error with operation name
- Missing required parameters throw descriptive errors
- File system errors propagate with original error messages

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
