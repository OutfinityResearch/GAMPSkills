# BacklogManager.test

## Description
This test file validates the BacklogManager module functions for loading, manipulating, and saving backlog sections. It ensures proper integration of IO and domain logic, stateless operations, and deterministic operations on backlog data.

## Dependencies
- BacklogManager.mjs (module under test)
- Node.js built-in assert module for validation
- Node.js fs/promises module for dynamic file creation/cleanup
- Console output for test reporting

## Test Implementation
Tests are implemented using Node.js assert module for equality checks. The test creates a temporary `specs_backlog.md` file dynamically with minimal test data, runs the tests asynchronously, and cleans up the file afterward. Functions are called directly with type and relativeFilePath parameters. Each test block outputs a success message to console upon passing. Assertions account for variable initial state (e.g., check increments rather than fixed lengths).

## Test Cases

### getSection Function
- **Assertion**: Retrieves section by relativeFilePath from loaded backlog using assert
- **Input**: type ('specs'/'docs'), relativeFilePath string
- **Expected Output**: Console log 'getSection tests passed.' if retrieved section matches
- **Purpose**: Validates section lookup by loading backlog

### recordIssue Function
- **Assertion**: Adds normalized issue to section's issues array and checks increment using assert
- **Input**: type, relativeFilePath, issue (string/object)
- **Expected Output**: Console log 'recordIssue tests passed.' if issue added correctly and array length increased
- **Purpose**: Ensures issue recording with proper normalization, numbering, and saving

### proposeFix Function
- **Assertion**: Adds normalized proposal to section's options array and checks increment using assert
- **Input**: type, relativeFilePath, proposal (string/object)
- **Expected Output**: Console log 'proposeFix tests passed.' if option added correctly and array length increased
- **Purpose**: Validates fix proposal handling and saving

### approveResolution Function
- **Assertion**: Sets resolution text and updates status if applicable using assert
- **Input**: type, relativeFilePath, resolutionString
- **Expected Output**: Console log 'approveResolution tests passed.' if resolution and status updated
- **Purpose**: Ensures resolution approval logic and saving

### findSectionsByPrefix Function
- **Assertion**: Lists section names starting with prefix using assert.deepEqual
- **Input**: type ('specs'/'docs'), prefix string
- **Expected Output**: Console log 'findSectionsByPrefix tests passed.' if filtered names match
- **Purpose**: Validates prefix-based filtering by loading backlog

### findSectionByFileName Function
- **Assertion**: Finds section name by file name suffix using assert
- **Input**: type, fileName string
- **Expected Output**: Console log 'findSectionByFileName tests passed.' if found name matches
- **Purpose**: Ensures file name lookup by loading backlog

### findSectionsByStatus Function
- **Assertion**: Lists sections with given status using assert.deepEqual
- **Input**: type, status string
- **Expected Output**: Console log 'findSectionsByStatus tests passed.' if filtered names match
- **Purpose**: Validates status-based querying by loading backlog