# Specification for gamp-rsp/DocumentManager.js

## Module Description
This module provides the `DocumentManager` class, which is responsible for the lifecycle management of high-level specification documents: User Requirements (URS), Functional Specifications (FS), and Non-Functional Specifications (NFS). It abstracts the file I/O and markdown parsing required to treat individual entries within these documents as distinct objects. All file I/O is performed synchronously, aligning with the tool's intended use in a CLI environment where sequential operations are standard.

## Dependencies
-   `../utils/file-io.mjs`: Imports `readFileSafe` and `writeFileSafe` for all file operations.
-   `../utils/markdown-parser.mjs`: Imports `extractChapters`, `replaceChapter`, and `parseHeading` for reading and manipulating document structure.
-   `../utils/id-generator.mjs`: Imports `nextId` to generate unique, sequential IDs for new requirements.
-   `../utils/chapter-builder.mjs`: Imports `buildChapter` to create standardized markdown content for new requirement entries.
-   `../utils/req-traceability.mjs`: Imports `ensureTraceabilityBlock`, `requirementDocName`, and `normaliseId` for handling traceability links.
-   `../utils/soplang.mjs`: Imports `buildSoplangComment` to generate metadata comments.

---

## Class: DocumentManager

### `constructor(gampRSPCore)`
-   **Process**: Stores the provided `gampRSPCore` instance, which it will use to resolve all document paths.

### Document I/O Methods
-   `readDocument(name)`: Reads the content of a document (e.g., "URS.md") using its `core` instance to get the full path.
-   `writeDocument(name, content)`: Writes content to a document using its `core` instance to get the full path.

### `collectIds(docName, prefix)`
-   **Description**: Scans a document and collects all existing requirement IDs that match a given prefix.
-   **Process**:
    1.  Reads the specified document.
    2.  Uses `extractChapters` to get all H2 sections.
    3.  For each chapter heading, it uses a regular expression to find a token matching the pattern `(URS|FS|NFS)-\d+`.
    4.  It returns an array of all matching, uppercase IDs.

### Requirement Creation Methods (`createURS`, `createFS`, `createNFS`)
-   **Description**: These methods create new entries in their respective documents.
-   **Common Process**:
    1.  Determine the target document name (e.g., "URS.md").
    2.  Call `collectIds` to get a list of existing IDs for that document type.
    3.  Call `nextId` with the list and a prefix (e.g., "URS") to generate a new, unique ID.
    4.  Construct the content for the new chapter.
        -   For FS and NFS, this includes generating a traceability block using `ensureTraceabilityBlock` and a `soplang` comment.
    5.  Use `buildChapter` to assemble the final markdown string for the new entry.
    6.  Read the entire existing document, append the new chapter, and write it back.
-   **Output**: The unique ID of the newly created requirement.

### Requirement Update Methods (`updateURS`, `updateFS`, `updateNFS`)
-   **Description**: These methods find and replace an existing requirement entry.
-   **Common Process**:
    1.  Generate the new chapter body using `buildChapter`, just like in the creation methods.
    2.  Read the entire content of the relevant document.
    3.  Use `replaceChapter`, passing the existing `id` and the new chapter body, to swap the content.
    4.  Write the modified content back to the file.

### Retirement/Obsoletion Methods (`retireURS`, `obsoleteFS`, `obsoleteNFS`)
-   **Description**: These methods mark a requirement as no longer active.
-   **Process (`retireGeneric`)**:
    1.  Finds the specific chapter by its `id`.
    2.  If found, it modifies the chapter body, replacing the line "Status: active" with "Status: retired".
    3.  It then uses `replaceChapter` to update the document with the modified chapter.

### `linkRequirementToDS(reqId, dsId)`
-   **Description**: The critical method for creating a traceability link from a requirement (FS/NFS) to a Design Specification (DS).
-   **Process**:
    1.  Uses `requirementDocName(reqId)` to find the correct file to modify ("FS.md" or "NFS.md").
    2.  Reads the file and uses `extractChapters` to find the specific chapter matching the `reqId`.
    3.  If the chapter is found, it splits its body into an array of lines.
    4.  It searches for a line that starts with "- Linked DS:".
    5.  **If the line exists**:
        a. It parses the existing comma-separated list of DS IDs.
        b. It adds the new `dsId` to the list if it's not already there.
        c. It reconstructs the line with the updated list.
    6.  **If the line does not exist**:
        a. It finds the location of the traceability block heading (e.g., `### Traceability`).
        b. It inserts a new line `- Linked DS: [dsId]` right after the heading.
    7.  It joins the lines back into a string and uses this to replace the old chapter body in the full document content.
    8.  Writes the final, updated content back to the file.