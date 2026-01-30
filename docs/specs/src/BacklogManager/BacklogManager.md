# BacklogManager

## Description
BacklogManager orchestrates both project backlogs (`./specs_backlog.md` and `./docs_backlog.md`) while enforcing the standard task format (Id / Description / Status / Affected Files / Options / Resolution). It loads raw backlog text, parses it into structured tasks, lets agents record proposed fixes, applies user-approved resolutions via injected hooks, and writes the serialized result back. It keeps operations deterministic and context-limited by extracting only the needed task and preserving a stable, human-editable layout.

## Dependencies
- `backlogIO` (see `./BacklogManager/backlogIO.md`) — reading/writing files, parsing/rendering backlog tasks, slicing/merging specific tasks
- `backlogDomain` (see `./BacklogManager/backlogDomain.md`) — STATUS enum, validation, filters, ChangeQueue
- Node `fs/promises` — file I/O
- Node `path` — path resolution

## Main functions
- `loadBacklog(type) -> { tasks, meta }`
  - Input: `type` (string `"specs"` or `"docs"` for backlog type).
  - Output: `{ tasks, meta }` where `tasks` is a dictionary keyed by numeric task id (fields: `id`, `description`, `status`, `affectedFiles[]`, `options[]`, `resolution`), and `meta` includes file info like `mtime`, `size`.
  - Behavior: resolves path from type, reads file, parses via `backlogIO.parse`, returns structured data for further operations.
- `getTask(type, taskId) -> task`
  - Input: `type` (string `"specs"` or `"docs"`), `taskId` (number or numeric string).
  - Output: `task` object (`{ id, description, status, affectedFiles[], options[], resolution }`) or null if missing.
  - Behavior: loads and parses backlog for the type, fetches the task by id.
- `proposeFix(type, taskId, proposal)`
  - Input: `type` (string `"specs"` or `"docs"`), `taskId` (number), `proposal` (raw string/object with `title`, optional `details`).
  - Output: updated task with appended option entry (`{ id, title, details? }`).
  - Behavior: loads and parses backlog for the type, normalizes and appends to Options, keeping stable numeric order, saves the backlog.
- `approveResolution(type, taskId, resolutionString)`
  - Input: `type` (string `"specs"` or `"docs"`), `taskId` (number), `resolutionString` (string chosen by user).
  - Output: updated task with `resolution` set; if the resolution is non-empty it sets status to `ok`.
  - Behavior: loads and parses backlog for the type, sets Resolution text, marks status `ok` when resolution is non-empty, saves the backlog.
- `applyChanges(type, taskId, approvedItems, hooks)`
  - Input: `type` (string `"specs"` or `"docs"`), `taskId` (number), `approvedItems` (array of option IDs or objects selected for application), `hooks` (object with functions to call external skills, e.g., `{ applySpecFix, applyDocFix }`).
  - Output: ordered list of executed changes (via `ChangeQueue`).
  - Behavior: loads and parses backlog for the type, sequences changes deterministically, calls hooks for changes, sets status to `ok`, saves the backlog.
- `saveBacklog(type, tasks)`
  - Input: `type` (string `"specs"` or `"docs"`), `tasks` (array/dictionary of task objects as defined above).
  - Output: writes file; returns confirmation/void; the serialized text is persisted.
  - Behavior: resolves path from type, renders with `backlogIO.render` and writes deterministically to disk.
- `findTasksByStatus(type, status) -> taskNames[]`
  - Input: `type` (string `"specs"` or `"docs"`), `status` (string from STATUS).
  - Output: array of task ids with the given status.
  - Behavior: loads and parses backlog, filters tasks by status.
- `setStatus(type, taskId, status)`
  - Input: `type` (string `"specs"` or `"docs"`), `taskId` (number), `status` (string from STATUS).
  - Output: void; updates the status of the task.
  - Behavior: loads and parses backlog, sets the status of the task by id, saves the backlog.
- `updateTask(type, taskId, updates)`
  - Input: `type` (string `"specs"` or `"docs"`), `taskId` (number), `updates` (object with properties to update).
  - Output: void; updates the task with the provided properties.
  - Behavior: loads and parses backlog, assigns the updates to the task, saves the backlog.
- `appendTask(type, initialContent)`
  - Input: `type` (string `"specs"` or `"docs"`), `initialContent` (string).
  - Output: void; adds a new task with the next numeric id.
  - Behavior: loads and parses backlog, creates the task with the initial content as description, status `needs_work`, empty affectedFiles/options, empty resolution, saves the backlog.

## Exports
- `loadBacklog`
- `getTask`
- `proposeFix`
- `approveResolution`
- `applyChanges`
- `saveBacklog`
- `findTasksByStatus`
- `setStatus`
- `updateTask`
- `appendTask`
