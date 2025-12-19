# Specification for GampRSPCore.js

## Module Description
This module provides the `GampRSPCore` class, which serves as the foundational layer of the GAMP-RSP system. Its primary role is to manage the file system structure of the workspace, ensuring all necessary directories and configuration files are present. It acts as the single source of truth for all file paths within the `.specs` directory, performing all file system interactions synchronously for simplicity and predictability in a CLI context.

## Dependencies
-   `node:path`: Used for constructing and manipulating file system paths in a platform-agnostic way.
-   `node:fs`: Used for **synchronous** interaction with the file system, such as checking for file existence, creating directories, and reading/writing files. This approach is suitable for a CLI tool.
-   `../../utils/file-io.mjs`: Imports `ensureDir`, `writeFileSafe`, and `readFileSafe` for robust file operations.
-   `../../utils/chapter-builder.mjs`: Imports `VERSION_HEADER` to create default content for new specification documents.
-   `../../utils/constants.mjs`: Imports `DEFAULT_DOCS` which defines the set of core documents to create.
-   `../../utils/req-traceability.mjs`: Imports `extractDSIdFromFileName` for resolving file paths.
-   `../../utils/formatting.mjs`: Imports `slugifyTitle` and `normaliseId` for creating and resolving file paths.

---

## Class: GampRSPCore

### Description
Manages the workspace environment for all GAMP-RSP operations. It handles the creation and validation of the `.specs` directory and all its required subdirectories and files. It also provides a set of getter methods that other managers use to retrieve canonical paths to various resources.

### `constructor(workspaceRoot)`
-   **Input**: `workspaceRoot` (string, optional), the absolute path to the project's root. Defaults to the current working directory.
-   **Process**:
    1.  Stores the `workspaceRoot`.
    2.  Constructs the path to the main specifications directory, `.specs`, within the root.
    3.  Initializes an `initialised` flag to `false`.
    4.  Calls the `ensureWorkspace` method to set up the directory structure.

### `configure(workspaceRoot)`
-   **Description**: Allows re-configuring the workspace root path after instantiation.
-   **Process**: Resets the `workspaceRoot`, `specsDir` path, and `initialised` flag, then calls `ensureWorkspace` again.

### `ensureWorkspace()`
-   **Description**: A critical idempotent method that sets up the entire `.specs` directory structure.
-   **Process**:
    1.  If the `initialised` flag is `true`, it returns immediately to avoid redundant work.
    2.  Calls `ensureDir` to create the `.specs` directory if it doesn't exist.
    3.  Iterates through the `DEFAULT_DOCS` constant. For each doc:
        a. Constructs the target file path inside `.specs`.
        b. If the file does not exist, it calls `writeFileSafe` to create it, using the `VERSION_HEADER` function to generate its initial content.
    4.  Calls `ensureDir` for each of the following subdirectories inside `.specs`: `DS`, `mock`, and `html_docs`.
    5.  Constructs the path for the `.ignore` file.
    6.  If the `.ignore` file does not exist, it creates it with a default list of patterns (`node_modules`, `.git`, `dist`, `coverage`).
    7.  Sets the `initialised` flag to `true`.

### Path Getter Methods
These methods ensure that other parts of the system use consistent and correct paths. They all rely on the initialized `specsDir`.
-   `getDocPath(name)`: Returns the full path to a document in the root of `.specs` (e.g., `.../.specs/URS.md`).
-   `getSpecsDirectory()`: Returns the full path to the `.specs` directory.
-   `getDSDir()`: Returns the full path to the `.specs/DS` directory.
-   `getMockDir()`: Returns the full path to the `.specs/mock` directory.
-   `getDocsDir()`: Returns the full path to the `.specs/html_docs` directory.
-   `getMatrixPath()`: Returns the full path to the `matrix.md` file.
-   `getIgnorePath()`: Returns the full path to the `.ignore` file.
-   `getCachePath()`: Returns the full path to the `.gamp-cache.json` file.

### `resolveDSFilePath(dsId, { title = '' })`
-   **Description**: Resolves the canonical file path for a Design Specification, either by finding an existing file or generating a new, standardized name.
-   **Process**:
    1.  Normalizes the input `dsId`. Throws an error if the ID is invalid.
    2.  Reads all entries in the `DS` directory.
    3.  Searches for an existing file that starts with the normalized ID (e.g., `DS-001-`). If found, returns its full path.
    4.  If no match is found, it checks for a legacy file named just `DS-001.md`.
    5.  If still no file is found, it generates a new file name by slugifying the `title` and combining it with the ID (e.g., `DS-001-my-new-design.md`). Returns the full path for this new name.

### Ignore List Management
-   `readIgnoreList()`: Reads the `.ignore` file, splits it into lines, and returns an array of trimmed, non-empty patterns.
-   `addIgnoreEntries(entries = [])`: Adds new patterns to the `.ignore` file, ensuring no duplicates. It reads the existing list, adds the new entries to a `Set` for automatic deduplication, and then writes the updated list back to the file.

### Cache Management
-   `readCache()`: Reads and parses the `.gamp-cache.json` file. It's wrapped in a `try...catch` block to handle JSON parsing errors or a missing file, returning an empty object in those cases.
-   `writeCache(data = {})`: Serializes the given JavaScript object into a pretty-printed JSON string and writes it to the `.gamp-cache.json` file.