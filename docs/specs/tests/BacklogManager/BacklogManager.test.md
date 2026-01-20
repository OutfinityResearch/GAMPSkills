# BacklogManager.test

## Description
This test file validates the BacklogManager class methods for loading, manipulating, and saving backlog sections. It ensures proper integration of IO and domain logic, correct state management, and deterministic operations on backlog data.

## Dependencies
- BacklogManager.mjs (class under test)
- Node.js built-in assert module for validation
- Console output for test reporting
- Pre-set sections data for testing (manually assigned to instance)

## Test Implementation
Tests are implemented using Node.js assert module for equality checks. Sections are manually set on the manager instance for testing purposes. Each test block outputs a success message to console upon passing. The manager is reused across tests.

## Test Cases

### getSection Method
- **Assertion**: Retrieves section by fileKey from loaded backlog using assert
- **Input**: fileKey string
- **Expected Output**: Console log 'getSection tests passed.' if retrieved section matches
- **Purpose**: Validates section lookup after loading

### recordIssue Method
- **Assertion**: Adds normalized issue to section's issues array using assert
- **Input**: sectionRef (fileKey), issue (string/object)
- **Expected Output**: Console log 'recordIssue tests passed.' if issue added correctly
- **Purpose**: Ensures issue recording with proper normalization and numbering

### proposeFix Method
- **Assertion**: Adds normalized proposal to section's options array using assert
- **Input**: sectionRef (fileKey), proposal (string/object)
- **Expected Output**: Console log 'proposeFix tests passed.' if option added correctly
- **Purpose**: Validates fix proposal handling

### approveResolution Method
- **Assertion**: Sets resolution text and updates status if applicable using assert
- **Input**: sectionRef (fileKey), resolutionString
- **Expected Output**: Console log 'approveResolution tests passed.' if resolution and status updated
- **Purpose**: Ensures resolution approval logic

### findSectionsByPrefix Method
- **Assertion**: Lists section names starting with prefix using assert.deepEqual
- **Input**: type ('specs'/'docs'), prefix string
- **Expected Output**: Console log 'findSectionsByPrefix tests passed.' if filtered names match
- **Purpose**: Validates prefix-based filtering

### findSectionByFileName Method
- **Assertion**: Finds section name by file name suffix using assert
- **Input**: type, fileName string
- **Expected Output**: Console log 'findSectionByFileName tests passed.' if found name matches
- **Purpose**: Ensures file name lookup

### findSectionsByStatus Method
- **Assertion**: Lists sections with given status using assert.deepEqual
- **Input**: type, status string
- **Expected Output**: Console log 'findSectionsByStatus tests passed.' if filtered names match
- **Purpose**: Validates status-based querying