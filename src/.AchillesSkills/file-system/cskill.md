# file-system
Executes file system operations (read, write, delete, copy, list) using nodeJS functions.

## Summary
Executes file system operations (read, write, delete, copy, list) using nodeJS functions. Provide natural language instructions like "create directory ./docs" or "write file ./test.txt with content hello".

## Input Format
- **operation** (string): Operation type (readFile, writeFile, appendFile, deleteFile, createDirectory, listDirectory, fileExists, copyFile, moveFile).
- **path** (string): Target file or directory path.
- **content** (string, optional): Content for write/append operations.
- **destination** (string, optional): Destination path for copy/move operations.
- **dependsOn** (string, optional): Dependency markers to enforce ordering; ignored by this skill.

Rules:
- First token is always the operation.
- Second token is always the path.
- Optional parameters must be provided as `paramName: value` on the same line.
- `dependsOn` can be provided to enforce execution order and is ignored by the parser.

Examples:
- "createDirectory ./docs"
- "writeFile ./test.txt content: hello world"
- "readFile ./package.json"
- "copyFile ./src/file.js destination: ./backup/file.js"

## Output Format
- **Type**: `string | object`
- **Success Example**: "File written successfully" or { exists: true } or ["file1.txt", "file2.txt"]
- **Error Example**: "Error: File not found."

## Constraints
- All paths must be relative to project root.
