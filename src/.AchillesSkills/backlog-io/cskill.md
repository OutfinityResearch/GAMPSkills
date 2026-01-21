# backlog-io
Executes backlog operations via BacklogManager methods.

## Summary
Executes backlog operations via BacklogManager methods.

## Input Format
- **operation** (string): Operation type (loadBacklog, getSection, recordIssue, proposeFix, approveResolution, findSectionsByPrefix, findSectionByFileName, findSectionsByStatus, setStatus, updateSection, appendSection).
- **type** (string): Backlog type ('specs' or 'docs').
- **fileKey** (string, optional): File key for section operations.
- **issue** (object, optional): Issue object for recordIssue.
- **proposal** (object, optional): Proposal object for proposeFix.
- **resolution** (string, optional): Resolution string for approveResolution.
- **prefix** (string, optional): Prefix for findSectionsByPrefix.
- **fileName** (string, optional): File name for findSectionByFileName.
- **status** (string, optional): Status for findSectionsByStatus or setStatus.
- **updates** (object, optional): Updates object for updateSection.
- **initialContent** (string, optional): Initial content for appendSection.

## Output Format
- **Type**: `object | array | string`
- **Success Example**: { sections: {...}, meta: {...} } or ["file1.md", "file2.md"]
- **Error Example**: "Error: Invalid backlog type."

## Constraints
- Type must be 'specs' or 'docs'.
- Operations must match BacklogManager API.
