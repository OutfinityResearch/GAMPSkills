# file-system
Executes file system operations (read, write, delete, copy, list) using nodeJS functions.

## Summary
Executes file system operations (read, write, delete, copy, list) using nodeJS functions. You must provide the function name from the options below(operation parameter). Do not provide bash commands.

## Input Format
- **operation** (string): Operation type (readFile, writeFile, appendFile, deleteFile, createDirectory, listDirectory, fileExists, copyFile, moveFile).
- **path** (string): Target file or directory path.
- **content** (string, optional): Content for write/append operations.
- **destination** (string, optional): Destination path for copy/move operations.

## Output Format
- **Type**: `string | object`
- **Success Example**: "File written successfully" or { exists: true } or ["file1.txt", "file2.txt"]
- **Error Example**: "Error: File not found."

## Constraints
- All paths must be relative to project root.
