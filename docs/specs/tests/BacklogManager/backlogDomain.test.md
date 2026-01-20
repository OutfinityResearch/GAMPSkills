# backlogDomain.test

## Description
This test file validates the domain logic for backlog management, including status enums, validation, issue normalization, markdown conversion, filtering, and the ChangeQueue class. It ensures that all domain rules are correctly enforced and that data transformations are deterministic.

## Dependencies
- backlogDomain.mjs (functions and classes under test)
- Node.js built-in assert module for validation
- Console output for test reporting

## Test Implementation
Tests are implemented using Node.js assert module for equality checks and error assertions. Each test block outputs a success message to console upon passing. The script runs synchronously and throws on failure.

## Test Cases

### STATUS Enum Validation
- **Assertion**: STATUS object contains 'ok', 'needs_work', 'blocked' using assert
- **Input**: None
- **Expected Output**: Console log 'STATUS enum tests passed.' if assertions succeed
- **Purpose**: Ensures status constants are defined correctly

### assertValidStatus Function
- **Assertion**: Throws error for invalid status, no error for valid using assert and try/catch
- **Input**: String status ('ok', 'invalid')
- **Expected Output**: Console log 'assertValidStatus tests passed.' if behavior matches
- **Purpose**: Validates status input enforcement

### nextAllowed Function
- **Assertion**: Allows valid transitions, throws for invalid using assert and try/catch
- **Input**: Current status, optional next status
- **Expected Output**: Console log 'nextAllowed tests passed.' if transitions enforced
- **Purpose**: Ensures state machine rules are followed

### normalizeIssue Function
- **Assertion**: Converts string or object to normalized issue using assert.deepEqual
- **Input**: String title or object {title, details?, status?}
- **Expected Output**: Console log 'normalizeIssue tests passed.' if conversions match
- **Purpose**: Standardizes issue input for storage

### toMarkdown Function
- **Assertion**: Formats issue to numbered markdown list item using assert
- **Input**: Normalized issue object
- **Expected Output**: Console log 'toMarkdown tests passed.' if output matches expected string
- **Purpose**: Ensures deterministic markdown serialization

### fromMarkdown Function
- **Assertion**: Parses numbered line to issue object using assert.deepEqual
- **Input**: String '1. Title'
- **Expected Output**: Console log 'fromMarkdown tests passed.' if parsed object matches
- **Purpose**: Ensures markdown parsing matches serialization

### filterByStatus Function
- **Assertion**: Filters sections by status using assert.deepEqual
- **Input**: Sections object, status string
- **Expected Output**: Console log 'filterByStatus tests passed.' if filter output correct
- **Purpose**: Validates filtering logic

### findByFile Function
- **Assertion**: Retrieves section by fileKey using assert.deepEqual and assert
- **Input**: Sections object, fileKey string
- **Expected Output**: Console log 'findByFile tests passed.' if lookup works
- **Purpose**: Ensures lookup by file path

### listIssues Function
- **Assertion**: Aggregates all issues from sections using assert.deepEqual
- **Input**: Sections object
- **Expected Output**: Console log 'listIssues tests passed.' if aggregation correct
- **Purpose**: Validates issue collection across backlog

### ChangeQueue Class
- **enqueue Method**: Adds change to queue (tested via drain)
- **drain Method**: Returns sorted changes, clears queue using assert.deepEqual
  - **Input**: None
  - **Expected Output**: Console log 'ChangeQueue tests passed.' if enqueue/drain/clear work
- **clear Method**: Empties queue (tested via drain)
- **Purpose**: Ensures deterministic change sequencing