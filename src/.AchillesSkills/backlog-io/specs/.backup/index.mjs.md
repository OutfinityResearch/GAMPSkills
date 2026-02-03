# Backlog IO Skill - Implementation Specification

## Purpose
The backlog-io skill provides a complete interface to the BacklogManager module, enabling the Achilles agent to manage project backlogs (specs and docs) through structured operations for tracking issues, proposals, resolutions, and task management.

## Capabilities

### Backlog Loading
- **loadBacklog**: Load entire backlog with tasks and metadata
- **getTask**: Retrieve specific task by numeric id

### Task Updates
- **proposeFix**: Add new proposal/option to a task
- **approveResolution**: Set resolution text for a task
- **addOptionsFromText**: Parse plain text list and add options to a task

### Task Discovery
- **findTasksByStatus**: Find all tasks by inferred status (needs_work, done)

### Task Modification
- **setStatus**: Only supports `done` to move to History
- **markDone**: Move a task to History with optional `doneText`
- **updateTask**: Apply partial updates to task
- **appendTask**: Create new task in backlog with the next numeric id

## Input Contract
The skill parses a single text command from `promptText`:

- First token: `operation`
- Second token: `type` (`specs` or `docs`)
- Second token: `type` (`specs` or `docs`) when provided
- Remaining text: chained `key: value` parameters

Supported keys: `taskId`, `proposal`, `resolution`, `status`, `updates`, `initialContent`, `doneText`.
Supported keys: `taskId`, `proposal`, `resolution`, `status`, `updates`, `initialContent`, `doneText`, `optionsText`.
Values for `proposal` and `updates` may be JSON if the value starts with `{` or `[`. Other values are treated as raw strings.

## Output Contract
- Objects for load/get operations: `{ tasks, history, meta }` or task object
- Arrays for find operations: `[taskId1, taskId2, ...]`
- Success strings for `setStatus`, `markDone`, `updateTask`, and `appendTask`
- Throws Error with descriptive message on failure

## Implementation Details

### BacklogManager Integration
- Direct import from `../../BacklogManager/BacklogManager.mjs`
- Operations delegate to corresponding BacklogManager functions after parsing

### Operation Routing
- Switch-case structure maps operation names to BacklogManager calls
- Parameters are extracted from the text command before routing
- Return values are passed back directly except for status/markDone/update/append, which return success strings

### Error Handling
- Invalid operation or backlog type triggers LLM argument extraction when possible
- BacklogManager errors propagate unchanged
- Missing required parameters are handled by BacklogManager

### Regex Patterns (Hardcoded)
- Token split: `/^(\S+)(?:\s+(\S+))?(?:\s+([\s\S]*))?$/`
- Key/value scan: `/\b(taskId|proposal|resolution|status|updates|initialContent|doneText)\s*:\s*/g`
- Key/value scan: `/\b(taskId|proposal|resolution|status|updates|initialContent|doneText|optionsText)\s*:\s*/g`
- Operation trim: `/\s+/` (split on whitespace)

### LLM Fallback (Hardcoded Signature)
Triggered only when operation is not allowed or type is invalid.

Call signature (must match exactly):
`extractArgumentsWithLLM(llmAgent, promptText, instructionText, ['operation', 'type', 'taskId', 'status', 'initialContent', 'doneText', 'optionsText'])`

- `instructionText` must be: `Extract backlog operation arguments. Allowed operations: <comma-separated allowedOperations>`
- Expected return: array in order `[operation, type, taskId, status, initialContent, doneText, optionsText]`
- If return is not an array, throw `Unknown operation: ${operation}`

### Dependencies
- `BacklogManager`: loadBacklog, getTask, proposeFix, approveResolution, addOptionsFromText, findTasksByStatus, setStatus, markDone, updateTask, appendTask

## Code Generation Guidelines
When regenerating this skill:
1. Maintain switch-case structure for operation routing
2. Keep all operations async
3. Import all BacklogManager functions as namespace
4. Parse `promptText` into `operation`, `type`, and chained `key: value` parameters
5. Parse JSON for `proposal` and `updates` only when the value starts with `{` or `[` 
6. Return BacklogManager results unchanged except for status/markDone/update/append (return success strings)
7. Use LLM fallback only if operation or type is invalid
