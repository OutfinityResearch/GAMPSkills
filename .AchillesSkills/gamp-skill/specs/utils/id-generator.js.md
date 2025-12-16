# Specification for utils/id-generator.js

## Module Description
This module provides a specialized function for generating new, sequential IDs. It is designed to prevent ID collisions and maintain a consistent, human-readable format for identifiers like `URS-001`, `FS-002`, etc.

## Dependencies
-   None.

---

## Function: nextId(existingIds, prefix)

### Description
Calculates and returns the next available ID in a sequence, based on a given prefix and a list of already existing IDs. For example, if the highest existing ID is `PROJ-009`, this function will return `PROJ-010`.

### Input
-   `existingIds` (Array<string>): An array of strings, where each string is a potential ID (e.g., `["PROJ-001", "TASK-005", "PROJ-003"]`). The function will only consider IDs that contain a numeric part.
-   `prefix` (string): The prefix for the new ID (e.g., `"PROJ"`).

### Process
1.  **Extract Numbers**:
    -   It maps over the `existingIds` array.
    -   For each `id` string, it uses a regular expression `/-(\d+)$/` to find and capture the sequence of digits that immediately follows the last hyphen in the string.
    -   If a match is found, the captured group (the number as a string) is converted to a `Number`.
    -   If no match is found, it returns `0`.
    -   The result is an array of numbers.
2.  **Filter and Find Max**:
    -   It filters the array of numbers to keep only those that are finite, just in case any parsing failed.
    -   If the resulting array of numbers is not empty, it uses `Math.max(...numbers)` to find the single largest number from the list.
    -   If the array is empty, the "next" number is considered to be `1`.
    -   If the array was not empty, the next number is `Math.max(...) + 1`.
3.  **Format New ID**:
    -   The calculated next number is converted to a string.
    -   The `.padStart(3, '0')` method is called on this string. This ensures the numeric part is always at least three characters long, adding leading zeros if necessary (e.g., `1` becomes `"001"`, `12` becomes `"012"`, `123` remains `"123"`).
    -   The final ID string is constructed by concatenating the `prefix`, a hyphen (`-`), and the zero-padded number string.

### Output
-   (string): The new, unique, and sequentially formatted ID.

### Example
-   **Input**: `existingIds` = `["TEST-001", "TEST-003"]`, `prefix` = `"TEST"`
-   **Process**:
    -   Numbers extracted: `[1, 3]`
    -   Max number: `3`
    -   Next number: `4`
    -   Padded number: `"004"`
-   **Output**: `"TEST-004"`