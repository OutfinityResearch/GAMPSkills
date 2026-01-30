# BacklogManager.test

## Description
This test file validates the BacklogManager module functions for loading, manipulating, and saving backlog tasks. It ensures proper integration of IO and domain logic, stateless operations, and deterministic operations on backlog data.

## Dependencies
- BacklogManager.mjs (module under test)
- Node.js built-in assert module for validation
- Node.js fs/promises module for dynamic file creation/cleanup
- Console output for test reporting

## Test Implementation
Tests are implemented using Node.js assert module for equality checks. The test creates a temporary `specs_backlog.md` file dynamically with minimal test data, runs the tests asynchronously, and cleans up the file afterward. Functions are called directly with type and numeric taskId parameters. Each test block outputs a success message to console upon passing. Assertions account for variable initial state (e.g., check increments rather than fixed lengths).

## Test Cases

### getTask Function
- **Assertion**: Retrieves task by numeric id from loaded backlog using assert
- **Input**: type ('specs'/'docs'), taskId number
- **Expected Output**: Console log 'getTask tests passed.' if retrieved task matches
- **Purpose**: Validates task lookup by loading backlog

### proposeFix Function
- **Assertion**: Adds normalized proposal to task's options array and checks increment using assert
- **Input**: type, taskId, proposal (string/object)
- **Expected Output**: Console log 'proposeFix tests passed.' if option added correctly and array length increased
- **Purpose**: Validates fix proposal handling and saving

### approveResolution Function
- **Assertion**: Sets resolution text and updates status if applicable using assert
- **Input**: type, taskId, resolutionString
- **Expected Output**: Console log 'approveResolution tests passed.' if resolution and status updated
- **Purpose**: Ensures resolution approval logic and saving

### setStatus Function
- **Assertion**: Updates task status and verifies with findTasksByStatus
- **Input**: type, taskId, status string
- **Expected Output**: Console log 'setStatus tests passed.' if status updated and task id appears
- **Purpose**: Validates status updates and retrieval

### updateTask Function
- **Assertion**: Updates task fields and verifies the change using assert
- **Input**: type, taskId, updates object
- **Expected Output**: Console log 'updateTask tests passed.' if updated fields match
- **Purpose**: Validates partial updates on a task

### appendTask Function
- **Assertion**: Appends a new task with the next numeric id and verifies the description
- **Input**: type, initialContent string
- **Expected Output**: Console log 'appendTask tests passed.' if task exists with expected content
- **Purpose**: Validates auto-increment task creation

### findTasksByStatus Function
- **Assertion**: Lists task ids with given status using assert.deepEqual
- **Input**: type, status string
- **Expected Output**: Console log 'findTasksByStatus tests passed.' if filtered ids match
- **Purpose**: Validates status-based querying by loading backlog
