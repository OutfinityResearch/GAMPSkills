# file-system
Executes file system operations (read, write, delete, copy, list) using nodeJS functions.

## Summary
Executes file system operations (read, write, delete, copy, list) using nodeJS functions. Input must use strict `operation path` with optional `options:` key-value pairs.

## Input Format
- **operation** (string): Operation type (readFile, writeFile, appendFile, deleteFile, createDirectory, listDirectory, fileExists, copyFile, moveFile).
- **path** (string): Target file or directory path.
- **options** (key-value list, optional): `options:` followed by `key: value` pairs.
- **dependsOn** (string, optional): Dependency markers to enforce ordering; ignored by this skill.

Rules:
- First token is always the operation.
- Second token is always the path.
- Optional parameters must be provided after `options:` as `key: value` pairs.
- Values with spaces or newlines must be wrapped in quotes.
- Exception: `content` may be unquoted and may span multiple lines; when unquoted it consumes the rest of the input until `dependsOn:` or end of input.
- Supported option keys: `content`, `destination`.
- `dependsOn:` can list multiple refs and is ignored by the parser.

Examples:
- createDirectory ./docs
- writeFile ./test.txt options: content: "hello world"
- writeFile ./specs.md options: content: ## Vision\nLine 1\nLine 2
- readFile ./package.json
- copyFile ./src/file.js options: destination: ./backup/file.js
- writeFile ./specs.md options: content: "..." dependsOn: "$createDir"

## Output Format
- **Type**: `string`
- **Success Example**: "File written successfully" or "{\"exists\":true}" or "[\"file1.txt\",\"file2.txt\"]"
- **Error Example**: "Error: File not found."

## Constraints
- All paths must be relative to project root.
