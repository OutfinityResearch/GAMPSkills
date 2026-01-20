# backlogIO.test

## Description
This test file validates the input/output operations for backlog files, including parsing markdown content into structured sections, rendering sections back to markdown, and utilities for slicing and merging specific sections. It ensures deterministic and reversible transformations between text and data formats.

## Dependencies
- backlogIO.mjs (functions under test)
- Node.js built-in assert module for validation
- Console output for test reporting
- Sample markdown content for parsing tests

## Test Implementation
Tests are implemented using Node.js assert module for deep equality and string inclusion checks. Each test block outputs a success message to console upon passing. Sample backlog content is defined as a constant for reuse.

## Test Cases

### parse Function
- **Assertion**: Converts markdown backlog to sections object using assert.deepEqual
- **Input**: String with multiple sections (### File: headers, **Description:**, etc.)
- **Expected Output**: Console log 'parse tests passed.' if parsed sections match expected structure
- **Purpose**: Validates markdown parsing logic, including numbered lists for issues/options

### render Function
- **Assertion**: Converts sections object back to markdown string using assert includes
- **Input**: Sections object with sample data
- **Expected Output**: Console log 'render tests passed.' if output contains expected elements
- **Purpose**: Ensures serialization is deterministic and human-readable

### sliceToSection Function
- **Assertion**: Extracts a single section's text from full backlog using assert includes
- **Input**: Full backlog string, target fileKey
- **Expected Output**: Console log 'sliceToSection tests passed.' if sliced content contains expected parts
- **Purpose**: Validates context limiting for focused operations

### mergeSection Function
- **Assertion**: Replaces a section in full backlog with updated text using assert includes
- **Input**: Full backlog string, new section text, target fileKey
- **Expected Output**: Console log 'mergeSection tests passed.' if merged content has updated fields
- **Purpose**: Ensures in-place merging preserves other sections