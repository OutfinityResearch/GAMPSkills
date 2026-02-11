# backlog-io

## Summary
Executes backlog operations via BacklogManager methods. Provide command-like instructions such as "loadBacklog specs" or "getTask docs taskId: 2".

## Input Format
- **operation** (string): Operation type (createBacklog, loadBacklog, getTask, approveOption, getApprovedTasks, getNewTasks, addOptionsFromText, markDone, updateTask, addTask).
- **type** (string): Backlog type ('specs' or 'docs').
- **taskId** (string or number, optional): Numeric task id for task operations.
- **optionIndex** (string or number, optional): 1-based option index for approveOption.
- **optionsText** (string, optional): Plain text list to parse into options for addOptionsFromText.
- **tasksText** (string, optional): Plain text list to parse into tasks for addTasksFromText.
- **updates** (object, optional): Updates object for updateTask (description/options/resolution only).
- **initialContent** (string, optional): Initial content for addTask.
- **dependsOn** (string, optional): Dependency markers to enforce ordering; ignored by this skill.

Rules:
- First token is always the operation.
- Second token is always the backlog type.
- Optional parameters must be provided as `paramName: value` on the same line.
- `dependsOn` can be provided to enforce execution order and is ignored by the parser.

Examples:
- createBacklog specs
- addTask specs initialContent: "First line\nSecond line" dependsOn: $createBacklog
- addOptionsFromText specs taskId: $addTask optionsText: 1. First\n2. Second dependsOn: $addTask
- loadBacklog specs
- approveOption specs taskId: 1 optionIndex: 2
- markDone specs taskId: 3

## Output Format
- **Type**: `object | array | string | number`
- **Success Example**: { tasks: {...}, history: [...], meta: {...} } or [{"index":1,"description":"...","options":[],"resolution":"..."}] or 3
- **Success Example (addTasksFromText)**: [1, 2, 3]
- **Error Example**: "Error: Invalid backlog type."

## Constraints
- Type must be 'specs' or 'docs'.
- Operations must match BacklogManager API.
