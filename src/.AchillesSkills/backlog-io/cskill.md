# backlog-io
Executes backlog operations via BacklogManager methods.

## Summary
Executes backlog operations via BacklogManager methods. Provide command-like instructions such as "loadBacklog specs" or "getTask docs taskId: 2".

## Input Format
- **operation** (string): Operation type (loadBacklog, getTask, proposeFix, approveResolution, addOptionsFromText, findTasksByStatus, setStatus, markDone, updateTask, appendTask).
- **type** (string): Backlog type ('specs' or 'docs').
- **taskId** (string or number, optional): Numeric task id for task operations.
- **proposal** (object, optional): Proposal object for proposeFix.
- **resolution** (string, optional): Resolution string for approveResolution.
- **status** (string, optional): Status for findTasksByStatus or setStatus (only `done` supported).
- **doneText** (string, optional): Resolution text when moving to History via markDone.
- **optionsText** (string, optional): Plain text list to parse into options for addOptionsFromText.
- **updates** (object, optional): Updates object for updateTask.
- **initialContent** (string, optional): Initial content for appendTask.

Rules:
- First token is always the operation.
- Second token is always the backlog type.
- Optional parameters must be provided as `paramName: value` on the same line.

Examples:
- "loadBacklog specs"
- "getTask docs taskId: 2"
- "findTasksByStatus specs status: needs_work"
- "markDone specs taskId: 3 doneText: Implemented and verified"
- "addOptionsFromText specs taskId: 2 optionsText: 1. First\n2. Second"
- "appendTask specs initialContent: First line\nSecond line"

## Output Format
- **Type**: `object | array | string`
- **Success Example**: { tasks: {...}, history: [...], meta: {...} } or ["1", "2"]
- **Error Example**: "Error: Invalid backlog type."

## Constraints
- Type must be 'specs' or 'docs'.
- Operations must match BacklogManager API.
