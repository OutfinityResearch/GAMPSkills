# Backlog API Skill - Implementation Specification

## Purpose
Provides a complete interface to the BacklogManager module for managing specs/docs backlogs through structured operations.

## Dependencies (Explicit Paths)
- `../../../../BacklogManager.mjs`
  - Namespace import as `BacklogManager`
- `../../../../utils/ArgumentResolver.mjs`
  - `extractArgumentsWithLLM`

## Public Exports
- `action(context: { llmAgent: object, recursiveAgent?: object, promptText: string }) -> Promise<string>`

## Supported Operations
- `createBacklog`
- `loadBacklog`
- `getTask`
- `approveTask`
- `getApprovedTasks`
- `getNewTasks`
- `markDone`
- `addOptionsFromText`
- `addTasksFromText`
- `updateTask`
- `addTask`

## Input Contract
The skill parses a single text command from `promptText`:
- First token: `operation`
- Second token: `type` (`specs` or `docs`) when provided
- Remaining text: chained `key: value` parameters

Supported keys:
- `taskId`
- `resolution`
- `updates`
- `initialContent`
- `optionsText`
- `tasksText`
- `dependsOn` (ignored by parser, but recognized in the key scan)

Values for `updates` may be JSON if the value starts with `{` or `[`. Other values are treated as raw strings.

## Output Contract
- Returns a string for all operations
- If the underlying BacklogManager result is not a string, it is JSON-stringified
- Throws Error with descriptive message on failure

## Internal Functions
- `parseKeyValueParams(text: string) -> object`
- `parseMaybeJson(value: string) -> string | object | array`
- `stringifyIfNeeded(value: unknown) -> string`
- `executeBacklogOperation({ operation, type, taskId, resolution, updates, initialContent, optionsText, tasksText }) -> Promise<string>`

## Operation Routing
`executeBacklogOperation` maps operations to BacklogManager calls:
- `createBacklog(type)`
- `loadBacklog(type)`
- `getTask(type, taskId)`
- `approveTask(type, taskId, resolution)`
- `getApprovedTasks(type)`
- `getNewTasks(type)`
- `markDone(type, taskId)`
- `addOptionsFromText(type, taskId, optionsText)`
- `addTasksFromText(type, tasksText)`
- `updateTask(type, taskId, updates)`
- `addTask(type, initialContent)`

All results are passed through `stringifyIfNeeded`.

## Parsing Details
- Token scan regex: `/^(\S+)(?:\s+(\S+))?(?:\s+([\s\S]*))?$/`
- Key scan regex: `/\b(taskId|resolution|updates|initialContent|optionsText|tasksText|dependsOn)\s*:\s*/g`
- `updates` value is parsed via `parseMaybeJson`

## LLM Fallback (Hardcoded Signature)
Triggered only when operation is not allowed or `type` is invalid.

Call signature (must match exactly):
```
extractArgumentsWithLLM(
  llmAgent,
  promptText,
  `Extract backlog operation arguments. Allowed operations: ${Array.from(allowedOperations).join(', ')}`,
  ['operation', 'type', 'taskId', 'resolution', 'initialContent', 'optionsText', 'tasksText']
)
```

Expected return:
- Array `[operation, type, taskId, resolution, initialContent, optionsText, tasksText]`
- If return is not an array, throw `Unknown operation: ${operation}`

## Code Generation Guidelines
- Maintain the switch-case routing structure
- Keep all operations async
- Import BacklogManager as a namespace
- Parse `promptText` into `operation`, `type`, and chained `key: value` parameters
- Parse JSON only for `updates` when the value starts with `{` or `[` 
- Use LLM fallback only if operation or type is invalid
