# backlogDomain.test

## Description
This test file validates the domain logic for backlog management, including status enums, validation, filtering, and the ChangeQueue class. It ensures that all domain rules are correctly enforced and that data transformations are deterministic.

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

### filterByStatus Function
- **Assertion**: Filters sections by status using assert.deepEqual
- **Input**: Sections object, status string
- **Expected Output**: Console log 'filterByStatus tests passed.' if filter output correct
- **Purpose**: Validates filtering logic

### ChangeQueue Class
- **enqueue Method**: Adds change to queue using a task id (tested via drain)
- **drain Method**: Returns sorted changes, clears queue using assert.deepEqual
  - **Input**: None
  - **Expected Output**: Console log 'ChangeQueue tests passed.' if enqueue/drain/clear work
- **clear Method**: Empties queue (tested via drain)
- **Purpose**: Ensures deterministic change sequencing
