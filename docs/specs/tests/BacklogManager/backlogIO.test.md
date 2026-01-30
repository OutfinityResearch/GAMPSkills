# backlogIO.test

## Description
This test file validates the input/output operations for backlog files, including parsing markdown content into structured tasks, rendering tasks back to markdown, and utilities for slicing and merging specific tasks. It ensures deterministic and reversible transformations between text and data formats.

## Dependencies
- backlogIO.mjs (functions under test)
- Node.js built-in assert module for validation
- Console output for test reporting
- Sample markdown content for parsing tests

## Test Implementation
Tests are implemented using Node.js assert module for deep equality and string inclusion checks. Each test block outputs a success message to console upon passing. Sample backlog content is defined as a constant for reuse.

## Test Cases

### parse Function
- **Assertion**: Converts markdown backlog to tasks object using assert.deepEqual
- **Input**: String with multiple tasks (## <number> headers, **Description:**, **Affected Files:**, etc.)
- **Expected Output**: Console log 'parse tests passed.' if parsed tasks match expected structure
- **Purpose**: Validates markdown parsing logic, including affected files and options

### render Function
- **Assertion**: Converts tasks object back to markdown string using assert includes
- **Input**: Tasks object with sample data
- **Expected Output**: Console log 'render tests passed.' if output contains expected elements
- **Purpose**: Ensures serialization is deterministic and human-readable

### sliceToTask Function
- **Assertion**: Extracts a single task's text from full backlog using assert includes
- **Input**: Full backlog string, target task id
- **Expected Output**: Console log 'sliceToTask tests passed.' if sliced content contains expected parts
- **Purpose**: Validates context limiting for focused operations

### mergeTask Function
- **Assertion**: Replaces a task in full backlog with updated text using assert includes
- **Input**: Full backlog string, new task text, target task id
- **Expected Output**: Console log 'mergeTask tests passed.' if merged content has updated fields
- **Purpose**: Ensures in-place merging preserves other tasks
