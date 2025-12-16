# Specification for gamp-rsp/ReportingManager.js

## Module Description
This module provides the `ReportingManager` class, responsible for aggregating data from all specification documents and generating human-readable reports. Its key functions are creating a comprehensive traceability matrix and generating a set of interlinked HTML documents for easy browsing.

## Dependencies
-   `node:fs`: For reading directories and checking file existence.
-   `node:path`: For joining paths.
-   `../utils/file-io.mjs`: Imports `readFileSafe`, `writeFileSafe`, `ensureDir`.
-   `../utils/markdown-parser.mjs`: Imports `extractChapters`, `parseHeading`.
-   `../utils/formatting.mjs`: Imports `formatTimestamp`, `renderTable`.
-   `../utils/req-traceability.mjs`: Imports `parseDSTrace`, `parseTraceLines`, `extractDSIdFromFileName`.
-   `../utils/soplang.mjs`: Imports `buildSoplangComment`.
-   `../utils/constants.mjs`: Imports `DEFAULT_DOCS`.

---

## Class: ReportingManager

### `constructor(gampRSPCore, documentManager)`
-   **Description**: Initializes the manager and its dependencies.
-   **Process**:
    1.  Stores the `gampRSPCore` and `documentManager` instances.
    2.  Immediately calls `refreshMatrix()` to ensure the traceability matrix is up-to-date upon initialization.

### `loadSpecs(filterText = '')`
-   **Description**: Consolidates content from all specification documents into a single string, with optional filtering.
-   **Process**:
    1.  Calls `refreshMatrix()` to ensure data is current.
    2.  Loads the content of `matrix.md` and all `DEFAULT_DOCS` (URS, FS, NFS).
    3.  Reads the directory for DS files and loads the content of each one.
    4.  Combines all loaded documents into a single array.
    5.  If `filterText` is provided, it filters the array to include only documents whose content (case-insensitively) includes the filter text.
    6.  Formats the final output by concatenating the content of each remaining document, prefixing each with a heading line indicating its name (e.g., `# URS.md`).

### `generateHtmlDocs()`
-   **Description**: Creates a static HTML website from all specification documents.
-   **Process**:
    1.  Calls `refreshMatrix()`.
    2.  Ensures the `html_docs` directory exists.
    3.  Defines a simple, hard-coded HTML template string that accepts a title and a body.
    4.  Iterates through core documents (URS, FS, NFS) and all DS files:
        a. Reads the markdown content.
        b. Extracts a title from the content.
        c. Wraps the raw markdown content in `<pre>` tags to preserve formatting.
        d. Injects the title and body into the HTML template.
        e. Writes the resulting HTML string to a corresponding `.html` file in the `html_docs` directory.
        f. Records the generated page's metadata (href, title, section) for the index.
    5.  Does the same for the `matrix.md` file.
    6.  Generates an `index.html` file that contains a main heading and lists of links to all the generated pages, grouped by section ('Core Specifications', 'Traceability Matrix', 'Design Specifications').

### `refreshMatrix()`
-   **Description**: A comprehensive method to build the entire traceability matrix from scratch.
-   **Process**:
    1.  **Data Collection**:
        a. Calls `ensureWorkspace()` on the core instance.
        b. Uses the `documentManager` to read `URS.md`, `FS.md`, and `NFS.md`. It then uses `extractChapters` to get individual requirement entries from each.
        c. Reads the `DS` directory and reads the content of every DS file.
    2.  **Data Parsing**:
        a. For each URS, FS, and NFS chapter, it uses `parseHeading` to get the ID and title.
        b. For FS and NFS chapters, it also uses `parseTraceLines` on the body to extract linked URS and DS IDs.
        c. For each DS file, it uses `parseHeading` for the ID/title and `parseDSTrace` to find linked URS and requirement IDs.
    3.  **Table Generation**:
        a. Prepares separate data arrays (`rows`) for four tables: URS, FS, NFS, and DS.
        b. The rows contain the ID, title, and any parsed traceability links.
        c. Uses the `renderTable` utility to convert these arrays into markdown table strings.
    4.  **SOPLang Generation**:
        a. Creates an array of `soplang` variable declarations (`@ID load path/to/file#ID`).
        b. A declaration is created for every single URS, FS, NFS, and DS entry.
        c. The array is joined into a newline-separated string and passed to `buildSoplangComment` to create the final comment block.
    5.  **Final Assembly**:
        a. Combines the SOPLang comment, a main title, a timestamp, and all the generated markdown tables into a single string.
        b. Writes this string to `matrix.md` using `writeFileSafe`.
    -   **Output**: Returns the path to the newly created/updated `matrix.md`.