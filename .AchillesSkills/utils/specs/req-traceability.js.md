# Specification for utils/req-traceability.js

## Module Description
This module centralizes all logic related to parsing, creating, and managing traceability information within and between specification documents. It provides helpers to determine document relationships and to generate standardized traceability markdown blocks.

## Dependencies
-   `./formatting.mjs`: Imports `normaliseId` to ensure all IDs are in a consistent format before being processed or stored.
-   `./soplang.mjs`: Imports `buildSoplangComment` to create the machine-readable metadata comments embedded in traceability blocks.

---

## Function: requirementDocName(reqId)

### Description
Given a requirement ID, this function returns the name of the markdown document where that requirement is expected to be defined.

### Input
-   `reqId` (string): A requirement identifier (e.g., `"FS-001"`).

### Process
1.  The input `reqId` is normalized (trimmed and uppercased).
2.  It checks if the normalized string starts with the prefix `"FS-"`. If so, it returns `"FS.md"`.
3.  It checks if the normalized string starts with the prefix `"NFS-"`. If so, it returns `"NFS.md"`.
4.  If neither condition is met, it returns `null`.

### Output
-   (string | null): The filename or null.

---

## Function: parseTraceLines(body = '')

### Description
Parses the markdown content of a requirement's body to find and extract its traceability links (specifically, its source URS and linked DS files).

### Input
-   `body` (string, optional): The markdown content of a single chapter.

### Process
1.  The input `body` is split into an array of lines.
2.  It searches the array for a line that matches a regular expression for a URS link (e.g., starts with `- URS:` or `- Source URS:`).
3.  It separately searches for a line that matches a regular expression for a DS link (e.g., starts with `- DS:` or `- Linked DS:`).
4.  **If a URS line is found**: It splits the line by the colon, takes the second part, and normalizes it to get the URS ID.
5.  **If a DS line is found**: It splits the line by the colon, takes the second part (which may be a comma-separated list), splits that list by commas, and then normalizes each resulting token to get an array of DS IDs. It filters out any empty or "PENDING" entries.

### Output
-   (Object): An object `{ urs: string, ds: Array<string> }` containing the found traceability links.

---

## Function: parseDSTrace(content = '')

### Description
A simpler parser specifically for DS files. It looks for lines explicitly linking to a source URS and a parent Requirement (FS/NFS).

### Input
-   `content` (string, optional): The full content of a DS file.

### Process
1.  Uses a regular expression `/-\s*URS:\s*([A-Z0-9-]+)/i` to find and capture the URS ID.
2.  Uses a separate regular expression `/-\s*(?:Requirement|Req):\s*([A-Z0-9-]+)/i` to find and capture the FS or NFS ID.
3.  The captured values are normalized.

### Output
-   (Object): An object `{ urs: string, req: string }` containing the found links.

---

## Function: ensureTraceabilityBlock(options)

### Description
A builder function that constructs a complete, standardized markdown traceability block, including a `soplang` comment.

### Input
-   `options` (Object): An object containing details for the block.
    -   `ursId`, `dsIds`, `label`, `specId`, `specType`.

### Process
1.  It cleans and deduplicates the `dsIds` array.
2.  It assembles an array of dependency tokens (e.g., `$URS-001`, `$DS-001`) from the `ursId` and `dsIds`.
3.  It uses these tokens to create a `soplang` command string (e.g., `@FS-001 := $URS-001 $DS-001`).
4.  It passes this command string to `buildSoplangComment` to get the final HTML comment.
5.  It constructs a markdown string containing a heading (the `label`), the `soplang` comment, and human-readable lines for the "Source URS" and "Linked DS".

### Output
-   (string): The full markdown block.

---

## Function: extractDSIdFromFileName(fileName)

### Description
Extracts a DS ID from a filename (e.g., `"DS-001-some-feature.md"` -> `"DS-001"`).

### Process
1.  Uses the regular expression `/(DS-\d+)/i` to find the ID pattern in the `fileName` string.
2.  If a match is found, it returns the first captured group, converted to uppercase. Otherwise, it returns `null`.