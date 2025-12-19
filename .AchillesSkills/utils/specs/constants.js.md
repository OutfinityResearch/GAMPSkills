# Specification for utils/constants.js

## Module Description
This module serves as a centralized location for static, hard-coded values that are used across the GAMP-RSP subsystem. Storing constants here prevents magic strings and makes configuration easier to manage. This module contains no logic.

## Dependencies
-   None.

---

## Constant: DEFAULT_DOCS

### Description
This constant defines the list of core specification documents that the system should ensure exist in any workspace. The `GampRSPCore` class iterates over this array during its `ensureWorkspace` process to create these files if they are missing.

### Data Structure
-   An array of JavaScript objects.
-   Each object has two properties:
    -   `filename` (string): The exact name of the file to be created in the `.specs` directory (e.g., `"URS.md"`).
    -   `title` (string): The full, human-readable title of the document, which is used by `VERSION_HEADER` to populate the H1 heading when the file is first created (e.g., `"User Requirements Specification"`).

### Value
The array contains exactly three objects, one for each of the primary requirement specification types:
1.  User Requirements Specification (`URS.md`)
2.  Functional Specification (`FS.md`)
3.  Non-Functional Specification (`NFS.md`)