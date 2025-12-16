# Specification for utils/soplang.js

## Module Description
This module provides a single, specialized utility function for creating `soplang` (Standard Operating Procedure Language) comments. These comments are a core part of the system's traceability and automation features, embedding machine-readable metadata directly into markdown files.

## Dependencies
-   None.

---

## Function: buildSoplangComment(commands)

### Description
Takes a string of `soplang` commands and wraps it in a specific JSON structure, which is then serialized and embedded within an HTML-style comment block. This specific format is designed to be parsed by an external tool or IDE extension.

### Input
-   `commands` (string): A string containing one or more `soplang` commands. These commands are treated as a single block of text and can contain newlines.

### Process
1.  It defines a fixed, nested JavaScript object structure: `{ 'achiles-ide-document': { commands: ... } }`.
2.  The input `commands` string is assigned as the value for the `commands` property within this structure.
3.  The entire JavaScript object is then serialized into a JSON string using `JSON.stringify()`. This process escapes any special characters within the `commands` string (like newlines `\n` or quotes `"`), making it safe to embed.
4.  The resulting JSON string is then wrapped inside an HTML comment, by concatenating `<!--`, the JSON string, and `-->`.

### Output
-   (string): A string formatted as an HTML comment containing the structured JSON payload.

### Example
-   **Input**: "@var1 := load file.md\n@var2 process $var1"
-   **Process**:
    1.  Object created: `{ 'achiles-ide-document': { commands: "@var1 := load file.md\n@var2 process $var1" } }`
    2.  JSON stringified: `'{"achiles-ide-document":{"commands":"@var1 := load file.md\\n@var2 process $var1"}}'`
-   **Output**: `'<!--{"achiles-ide-document":{"commands":"@var1 := load file.md\\n@var2 process $var1"}}-->'