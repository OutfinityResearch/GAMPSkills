# backlog-io

## Summary
Executes backlog operations via BacklogManager methods. Provide command-like instructions such as "loadBacklog specs" or "getTask docs taskId: 2".

## Input Format
- **operation** (string): Operation type (createBacklog, flush, loadBacklog, getTask, approveOption, getApprovedTasks, getNewTasks, addOptionsFromText, markDone, updateTask, addTask).
- **type** (string): Backlog type ('specs' or 'docs').
- **taskId** (string or number, optional): Numeric task id for task operations.
- **optionIndex** (string or number, optional): 1-based option index for approveOption.
- **optionsText** (string, optional): Plain text list to parse into options for addOptionsFromText.
- **updates** (object, optional): Updates object for updateTask (description/options/resolution only).
- **initialContent** (string, optional): Initial content for addTask.

Rules:
- First token is always the operation.
- Second token is always the backlog type.
- Optional parameters must be provided as `paramName: value` on the same line.

Examples:
- "createBacklog specs"
- "flush specs"
- "loadBacklog specs"
- "getTask docs taskId: 2"
- "getApprovedTasks specs"
- "getNewTasks docs"
- "approveOption specs taskId: 1 optionIndex: 2"
- "markDone specs taskId: 3"
- "addOptionsFromText specs taskId: 2 optionsText: 1. First\n2. Second"
- "addTask specs initialContent: First line\nSecond line"

## Output Format
- **Type**: `object | array | string | number`
- **Success Example**: { tasks: {...}, history: [...], meta: {...} } or [{"index":1,"description":"...","options":[],"resolution":"..."}] or 3
- **Error Example**: "Error: Invalid backlog type."

## Constraints
- Type must be 'specs' or 'docs'.
- Operations must match BacklogManager API.
