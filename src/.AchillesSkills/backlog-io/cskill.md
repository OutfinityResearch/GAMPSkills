# backlog-io
Executes backlog operations via BacklogManager methods.

## Summary
Executes backlog operations via BacklogManager methods. Provide natural language instructions like "load specs backlog" or "get task from docs backlog with key myfile".

## Input Format
- **operation** (string): Operation type (loadBacklog, getTask, recordIssue, proposeFix, approveResolution, findTasksByPrefix, findTaskByFileName, findTasksByStatus, setStatus, updateTask, appendTask).
- **type** (string): Backlog type ('specs' or 'docs').
- **fileKey** (string, optional): File key for task operations.
- **issue** (object, optional): Issue object for recordIssue.
- **proposal** (object, optional): Proposal object for proposeFix.
- **resolution** (string, optional): Resolution string for approveResolution.
- **prefix** (string, optional): Prefix for findTasksByPrefix.
- **fileName** (string, optional): File name for findTaskByFileName.
- **status** (string, optional): Status for findTasksByStatus or setStatus.
- **updates** (object, optional): Updates object for updateTask.
- **initialContent** (string, optional): Initial content for appendTask.

Examples:
- "loadBacklog specs"
- "getTask docs myfile"
- "findTasksByStatus specs completed"
- "appendTask specs newfile initial content here"

## Output Format
- **Type**: `object | array | string`
- **Success Example**: { tasks: {...}, meta: {...} } or ["file1.md", "file2.md"]
- **Error Example**: "Error: Invalid backlog type."

## Constraints
- Type must be 'specs' or 'docs'.
- Operations must match BacklogManager API.
