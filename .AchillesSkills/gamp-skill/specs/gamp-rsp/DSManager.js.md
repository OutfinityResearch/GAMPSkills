# Specification for gamp-rsp/DSManager.js

## Module Description
This module provides the `DSManager` class, which is dedicated to managing Design Specification (DS) documents. These documents are detailed technical plans that link high-level requirements to concrete implementation details. The manager handles the full lifecycle of DS files, from creation and updating to managing embedded test cases and file descriptions. It relies on synchronous file system operations, consistent with its design as a CLI-first tool.

## Dependencies
-   `node:fs`: For synchronous file system operations like reading directories and checking file existence.
-   `node:path`: For cross-platform path manipulation.
-   `../utils/file-io.mjs`: Imports `readFileSafe`, `writeFileSafe`, `ensureDir`.
-   `../utils/id-generator.mjs`: Imports `nextId`.
-   `../utils/formatting.mjs`: Imports `slugifyTitle`, `normaliseId`, `formatTimestamp`.
-   `../utils/soplang.mjs`: Imports `buildSoplangComment`.
-   `../utils/req-traceability.mjs`: Imports `extractDSIdFromFileName`.
-   `../utils/markdown-parser.mjs`: Imports `extractChapters`, `replaceChapter`.

---

## Class: DSManager

### `constructor(gampRSPCore, documentManager)`
-   **Description**: Initializes the DSManager with its dependencies.
-   **Process**:
    1.  Stores the `gampRSPCore` instance for file system access.
    2.  Stores the `documentManager` instance, which will be used to create backlinks from requirements to the DS files created here.

### `resolveDSFilePath(dsId, { title = '' })`
-   **Description**: Finds the path to an existing DS file or determines the correct path for a new one. This logic is crucial for allowing files to be renamed while maintaining a stable ID.
-   **Process**:
    1.  Normalizes the `dsId`.
    2.  Reads all filenames in the `DS` directory.
    3.  Looks for a file whose name *starts with* the normalized ID followed by a hyphen (e.g., `DS-001-`). This is the primary lookup strategy.
    4.  If not found, it checks for a legacy file named exactly `DS-001.md`.
    5.  If still not found, it generates a new, ideal filename by slugifying the provided `title` and combining it with the `dsId` (e.g., `DS-001-a-new-feature.md`).
-   **Output**: The absolute path to the matched or newly determined file.

### `createDS(title, description, architecture, ursIds, reqIds, options = {})`
-   **Description**: Creates a new, fully-structured DS markdown file.
-   **Process**:
    1.  Generates a new, unique DS ID using `nextId`.
    2.  **SOPLang Comment Generation**:
        a. Normalizes all incoming `ursIds`, `reqIds`, and `dsIds`.
        b. Creates an array of dependency tokens (e.g., `$URS-001`, `$FS-001`).
        c. Constructs a `soplang` command string that defines a prompt and a compilation step (e.g., `@prompt := $DS-001 $URS-001...`).
        d. Wraps this command in a JSON structure inside an HTML comment using `buildSoplangComment`.
    3.  **Markdown Assembly**:
        a. Assembles the full markdown content as a multi-line string.
        b. Includes sections: Title (with ID), Version, Scope & Intent, Architecture, and Traceability.
        c. The Traceability section contains the generated `soplang` comment and human-readable lists of linked URS, FS/NFS, and DS requirements.
    4.  **File Writing**:
        a. Determines the target file path using `resolveDSFilePath`.
        b. Writes the generated markdown payload to the file.
    5.  **Back-linking**: Iterates through the provided `reqIds` and calls `this.docManager.linkRequirementToDS` for each one to create a link from the FS/NFS document back to this new DS.
-   **Output**: The ID of the newly created DS.

### `updateDS(id, title, description, architecture)`
-   **Description**: Updates the core descriptive sections of an existing DS file.
-   **Process**:
    1.  Resolves the file path for the given `id`.
    2.  Reads the file's content.
    3.  Uses `replaceChapter` twice: once to replace the "Scope & Intent" section and a second time to replace the "Architecture" section.
    4.  Writes the modified content back to the file.

### Test Management (`createTest`, `updateTest`, `deleteTest`)
-   **Description**: These methods manage test case definitions embedded within a DS file under the `## Tests` section.
-   **`createTest`**: Generates a new unique `TEST-` ID, formats a markdown block for the test case, and appends it under the `## Tests` anchor in the specified DS file.
-   **`updateTest`**: Finds the DS file containing the given `testId`. It then uses a regular expression to find and replace the entire markdown block for that test with new content.
-   **`deleteTest`**: Finds the DS file and uses a regular expression to find and remove the entire markdown block for that test.

### `describeFile(...)`
-   **Description**: Appends a highly detailed description of a single source code file to the `## File Impact` section of a DS.
-   **Process**:
    1.  Gathers and sanitizes all input parameters (`filePath`, `description`, `exports`, `dependencies`, etc.).
    2.  The `exports` array is specially processed to handle objects with name, description, and diagram properties.
    3.  Constructs a detailed markdown payload with subsections for Why, How, What, Description, Exports (including ASCII diagrams if provided), Dependencies, Side Effects, and Concurrency.
    4.  Calls `appendToDS` to add this payload under the `## File Impact` anchor.
-   **Output**: The generated markdown payload string.