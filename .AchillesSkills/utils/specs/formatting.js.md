# Specification for utils/formatting.js

## Module Description
This module provides a collection of pure utility functions for transforming data into various standardized string formats. These functions are used for creating consistent timestamps, rendering data structures as markdown tables, creating URL-friendly slugs, and normalizing IDs.

## Dependencies
-   None.

---

## Function: formatTimestamp(value = Date.now())

### Description
Converts a numeric timestamp or date-like value into a full ISO 8601 string in UTC.

### Input
-   `value` (number | string, optional): The value to be converted. Can be a Unix timestamp (milliseconds) or any value that the `Date` constructor can parse. If not provided, it defaults to the current time via `Date.now()`.

### Process
1.  It first validates that the input `value` is a finite number. If not, it defaults to `Date.now()`.
2.  It creates a new `Date` object from the numeric value.
3.  It calls the `.toISOString()` method on the `Date` object, which produces the desired format (e.g., `2025-12-16T12:00:00.000Z`).

### Output
-   (string): The ISO-formatted date string.

---

## Function: renderTable(headers = [], rows = [])

### Description
Renders a 2D array of data into a GitHub-flavored markdown table string.

### Input
-   `headers` (Array<string>, optional): An array of strings representing the table's column headers.
-   `rows` (Array<Array<string>>, optional): An array of arrays, where each inner array represents a row and its elements are the cell values.

### Process
1.  Checks if the `rows` array is empty. If so, it returns a hardcoded string indicating no entries.
2.  **Header Row**: It creates the header row string by joining the `headers` with ` | ` and wrapping the result in pipes (e.g., `| Header1 | Header2 |`).
3.  **Separator Row**: It creates the markdown separator line by mapping each header to the string `---`, joining them with ` | `, and wrapping them in pipes (e.g., `| --- | --- |`).
4.  **Body Rows**: It iterates over the `rows` array. For each inner `row` array, it joins the elements with ` | ` and wraps the result in pipes. Finally, it joins all the resulting row strings with a newline character.
5.  It combines the header, separator, and body strings into a single multi-line string.

### Output
-   (string): The complete markdown table as a single string.

---

## Function: slugifyTitle(value)

### Description
Converts an arbitrary string into a clean, URL-friendly "slug."

### Input
-   `value` (string): The string to convert.

### Process
1.  Checks if the input `value` is a non-empty string. If not, it returns a default value of `'design'`.
2.  Trims leading/trailing whitespace from the string.
3.  Converts the entire string to lower case.
4.  Uses a regular expression `/[^a-z0-9]+/g` to replace any sequence of one or more characters that are *not* a lowercase letter or a digit with a single hyphen (`-`).
5.  Uses a second regular expression `/^-+|-+$/g` to remove any hyphens from the beginning or end of the string.
6.  If the resulting string is empty (e.g., the input was only symbols), it returns the default value `'design'`; otherwise, it returns the cleaned slug.

### Output
-   (string): The resulting slug.

---

## Function: normaliseId(value)

### Description
Cleans and standardizes an ID string. This is used throughout the system to ensure that IDs are compared and stored in a consistent format.

### Input
-   `value` (string): The ID string to process.

### Process
1.  Checks if the input `value` is a non-empty string. If not, it returns an empty string.
2.  Trims any leading or trailing whitespace.
3.  Converts the entire string to upper case.

### Output
-   (string): The normalized ID.