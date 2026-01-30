# Backlog IO Skill - Implementation Specification

## Purpose
The backlog-io skill provides a complete interface to the BacklogManager module, enabling the Achilles agent to manage project backlogs (specs and docs) through structured operations for tracking issues, proposals, resolutions, and task management.

## Capabilities

### Backlog Loading
- **loadBacklog**: Load entire backlog with tasks and metadata
- **getTask**: Retrieve specific task by file key

### Issue Management
- **recordIssue**: Add new issue to a task
- **proposeFix**: Add new proposal/option to a task
- **approveResolution**: Set resolution text for a task

### Task Discovery
- **findTasksByPrefix**: Find all tasks matching path prefix
- **findTaskByFileName**: Find task by file name
- **findTasksByStatus**: Find all tasks with specific status

### Task Modification
- **setStatus**: Update task status
- **updateTask**: Apply partial updates to task
- **appendTask**: Create new task in backlog

## Input Contract
The skill parses a single text command from `promptText`:

- First token: `operation`
- Second token: `type` (`specs` or `docs`)
- Remaining text: chained `key: value` parameters

Supported keys: `fileKey`, `issue`, `proposal`, `resolution`, `prefix`, `fileName`, `status`, `updates`, `initialContent`.
Values for `issue`, `proposal`, and `updates` may be JSON if the value starts with `{` or `[`. Other values are treated as raw strings.

## Output Contract
- Objects for load/get operations: `{ tasks, meta }` or task object
- Arrays for find operations: `[fileKey1, fileKey2, ...]`
- Success strings for `setStatus`, `updateTask`, and `appendTask`
- Throws Error with descriptive message on failure

## Implementation Details

### BacklogManager Integration
- Direct import from `../../BacklogManager/BacklogManager.mjs`
- Operations delegate to corresponding BacklogManager functions after parsing

### Operation Routing
- Switch-case structure maps operation names to BacklogManager calls
- Parameters are extracted from the text command before routing
- Return values are passed back directly except for status/update/append, which return success strings

### Error Handling
- Invalid operation or backlog type triggers LLM argument extraction when possible
- BacklogManager errors propagate unchanged
- Missing required parameters are handled by BacklogManager

### Dependencies
- `BacklogManager`: All exported functions (loadBacklog, getTask, recordIssue, proposeFix, approveResolution, findTasksByPrefix, findTaskByFileName, findTasksByStatus, setStatus, updateTask, appendTask)

## Code Generation Guidelines
When regenerating this skill:
1. Maintain switch-case structure for operation routing
2. Keep all operations async
3. Import all BacklogManager functions as namespace
4. Parse `promptText` into `operation`, `type`, and chained `key: value` parameters
5. Parse JSON for `issue`, `proposal`, and `updates` only when the value starts with `{` or `[` 
6. Return BacklogManager results unchanged except for status/update/append (return success strings)
7. Use LLM fallback only if operation or type is invalid
