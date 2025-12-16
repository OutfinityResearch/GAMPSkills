# Specification for utils/file-io.js

## Module Description
This module provides a small set of robust, higher-level utility functions for interacting with the file system. These functions are designed to be "safe," meaning they handle common errors (like a file not existing or a directory needing to be created) internally, simplifying file I/O operations in other parts of the application. All file operations are **synchronous**, which is a deliberate design choice suitable for a command-line interface (CLI) tool where a blocking, sequential workflow is expected and simplifies the overall architecture.

## Dependencies
-   `node:fs`: The core Node.js module for all file system interactions.
-   `node:path`: Used for platform-agnostic path operations, specifically to extract the directory name from a file path.

---

## Function: ensureDir(dirPath)

### Description
Guarantees that a directory exists at a given path. It is a critical utility for functions that need to write files, as it prevents "ENOENT: no such file or directory" errors.

### Input
-   `dirPath` (string): The absolute or relative path to the directory that needs to exist.

### Process
1.  It uses `fs.existsSync()` to check if a directory (or file) already exists at `dirPath`.
2.  If nothing exists at the path, it calls `fs.mkdirSync()`.
3.  The `recursive: true` option is passed to `mkdirSync`. This is a crucial detail, as it means Node.js will automatically create all necessary parent directories in the path, much like the `mkdir -p` command in Unix-like systems. If the directory already exists, `mkdirSync` with this option does nothing and does not throw an error.

### Side Effects
-   May create one or more directories on the local file system.

---

## Function: readFileSafe(filePath, fallback = '')

### Description
Reads the entire content of a text file and returns it as a string. It is designed to fail gracefully by returning a default value rather than throwing an error if the file cannot be read.

### Input
-   `filePath` (string): The path to the file to be read.
-   `fallback` (any, optional): The value to return if any error occurs during reading. Defaults to an empty string.

### Process
1.  A `try...catch` block is used to wrap the file reading operation.
2.  **Inside the `try` block**: It calls `fs.readFileSync()` with the `filePath` and `'utf8'` encoding to get the file's content as a string. If successful, this string is returned.
3.  **Inside the `catch` block**: If `readFileSync` throws any error (e.g., the file does not exist, permissions are denied), the error is caught, and the `fallback` value is returned instead.

### Output
-   (string): The content of the file, or the `fallback` value if an error occurred.

---

## Function: writeFileSafe(filePath, content)

### Description
Writes a string of content to a specified file. It combines directory creation and file writing into a single, convenient operation.

### Input
-   `filePath` (string): The path of the file to be created or overwritten.
-   `content` (string): The string content to write to the file.

### Process
1.  It first calls `ensureDir()`, passing it the directory portion of the `filePath`. The directory path is obtained using `path.dirname(filePath)`. This step guarantees the target directory exists before attempting to write the file.
2.  It then calls `fs.writeFileSync()` to write the `content` to the `filePath`. If the file already exists, it will be overwritten.

### Side Effects
-   Creates or overwrites a file on the local file system.
-   May create parent directories.