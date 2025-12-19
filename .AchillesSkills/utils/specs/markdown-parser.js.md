# Specification for utils/markdown-parser.js

## Module Description
This module provides a set of powerful utilities for parsing and manipulating markdown-formatted strings. It is specifically tailored to a document structure where content is organized into "chapters," each starting with a level-2 heading (`##`).

## Dependencies
-   None.

---

## Function: extractChapters(content)

### Description
Scans a markdown document and divides it into a structured array of chapters. A chapter is defined as any section of text that begins with a level-2 heading.

### Input
-   `content` (string): The full markdown string to be parsed.

### Process
1.  It uses a global, multi-line regular expression (`/^##\s+(.*?)$/gm`) to find all occurrences of lines that start with `##`.
2.  The regex execution (`regex.exec()`) is placed in a `while` loop to find all matches in the `content`. For each match, it stores an object containing the heading text and its starting `index` in the original string.
3.  After finding all headings, it iterates through the list of matches. For each match, it calculates the `end` position of its chapter's content. The end position is simply the `start` position of the *next* chapter. For the very last chapter, the end position is the total length of the `content` string.
4.  It returns a new array of objects, where each object represents a chapter and contains the `heading` text, the full `body` of the chapter (from its `##` heading to the start of the next one), and the `start` and `end` indices.

### Output
-   (Array<Object>): An array of chapter objects.

---

## Function: replaceChapter(content, heading, newBody)

### Description
Finds a chapter by its heading and replaces its entire content with a new string. If the chapter doesn't exist, it appends the new content to the end of the document.

### Input
-   `content` (string): The full markdown document.
-   `heading` (string): The heading of the chapter to replace. The logic looks for a chapter whose heading *starts with* this string, allowing for partial matches (e.g., finding "FS-001 – Title" by just providing "FS-001").
-   `newBody` (string): The new content (a markdown string) to insert in place of the old chapter.

### Process
1.  It calls `extractChapters(content)` to get a structured view of the document.
2.  It uses the `.find()` method on the array of chapters to find the first chapter whose `heading` property starts with the provided `heading` string.
3.  **If a chapter is found**: It reconstructs the document by taking the slice of the original `content` from the beginning up to the chapter's `start` index, appending the `newBody`, and finally appending the slice of the original `content` from the chapter's `end` index to the very end. This effectively cuts out the old chapter and splices in the new one.
4.  **If no chapter is found**: It returns the original `content` with the `newBody` appended to the end, separated by newlines for proper formatting.

### Output
-   (string): The full document content with the chapter replaced or appended.

---

## Function: parseHeading(heading = '')

### Description
Deconstructs a standard chapter heading string to separate the machine-readable ID from the human-readable title.

### Input
-   `heading` (string, optional): The heading to parse (e.g., `"DS-001 – My Design Spec"`).

### Process
1.  **ID Extraction**: It uses a regular expression `/(URS|FS|NFS|DS)-\d+/i` to find the first occurrence of a standard ID pattern. If a match is found, it's converted to uppercase; otherwise, the `id` is an empty string.
2.  **Title Extraction**:
    -   It first checks if the heading contains a "–" (en-dash) character. If so, it splits the string by the dash and takes the second part as the title.
    -   If there's no dash, it assumes the ID and title are separated by whitespace. It uses another regular expression `/^(URS|FS|NFS|DS)-\d+\s*[-–]?\s*/i` to match and remove the ID part from the beginning of the string.
    -   The remaining part of the string is considered the title.
    -   All extracted titles are trimmed of whitespace.

### Output
-   (Object): An object with two properties: `id` and `title`.