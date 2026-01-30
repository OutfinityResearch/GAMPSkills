# BacklogManager

## Description
BacklogManager orchestrates both project backlogs (`./specs_backlog.md` and `./docs_backlog.md`) while enforcing the standard task format (Name / Description / Status / Issues / Options / Resolution). It loads raw backlog text, parses it into structured tasks, lets agents record issues and proposed fixes, applies user-approved resolutions via injected hooks, and writes the serialized result back. It keeps operations deterministic and context-limited by extracting only the needed task and preserving a stable, human-editable layout.

## Dependencies
- `backlogIO` (see `./BacklogManager/backlogIO.md`) — reading/writing files, parsing/rendering backlog tasks, slicing/merging specific tasks
- `backlogDomain` (see `./BacklogManager/backlogDomain.md`) — STATUS enum, models and validation for issues/proposals/resolutions, filters, ChangeQueue
- Node `fs/promises` — file I/O
- Node `path` — path resolution

## Main functions
- `loadBacklog(type) -> { tasks, meta }`
  - Input: `type` (string `"specs"` or `"docs"` for backlog type).
  - Output: `{ tasks, meta }` where `tasks` is an array/dictionary of task objects keyed by file (fields: `name`, `description`, `status`, `issues[]`, `options[]`, `resolution`), and `meta` includes file info like `mtime`, `size`.
  - Behavior: resolves path from type, reads file, parses via `backlogIO.parse`, returns structured data for further operations.
- `getTask(type, relativeFilePath) -> task`
  - Input: `type` (string `"specs"` or `"docs"`), `relativeFilePath` (string relative path to the target file, e.g., `docs/specs/src/foo/bar.md`).
  - Output: `task` object (`{ name, description, status, issues[], options[], resolution }`) or null if missing.
  - Behavior: loads and parses backlog for the type, fetches the task from the `tasks`.
- `recordIssue(type, relativeFilePath, issue)`
  - Input: `type` (string `"specs"` or `"docs"`), `relativeFilePath` (string), `issue` (raw object/string to be normalized; expects fields like `title`, `details?`, `status?`).
  - Output: updated task with appended normalized issue (`{ id, title, details?, status? }`).
  - Behavior: loads and parses backlog for the type, normalizes via `backlogDomain.normalizeIssue`, appends to Issues, preserves numbering, saves the backlog.
- `proposeFix(type, relativeFilePath, proposal)`
  - Input: `type` (string `"specs"` or `"docs"`), `relativeFilePath` (string), `proposal` (raw string/object with `title`, optional `details`).
  - Output: updated task with appended option entry (`{ id, title, details? }`).
  - Behavior: loads and parses backlog for the type, normalizes and appends to Options, keeping stable numeric order, saves the backlog.
- `approveResolution(type, relativeFilePath, resolutionString)`
  - Input: `type` (string `"specs"` or `"docs"`), `relativeFilePath` (string), `resolutionString` (string chosen by user).
  - Output: updated task with `resolution` set; if the resolution is non-empty it sets status to `ok`.
  - Behavior: loads and parses backlog for the type, sets Resolution text, marks status `ok` when resolution is non-empty, saves the backlog.
- `applyChanges(type, relativeFilePath, approvedItems, hooks)`
  - Input: `type` (string `"specs"` or `"docs"`), `relativeFilePath` (string), `approvedItems` (array of issue/option IDs or objects selected for application), `hooks` (object with functions to call external skills, e.g., `{ applySpecFix, applyDocFix }`).
  - Output: ordered list of executed changes (via `ChangeQueue`).
  - Behavior: loads and parses backlog for the type, sequences changes deterministically, calls `applySpecFix` for `issue` changes and `applyDocFix` for `option` changes, sets status to `ok`, saves the backlog.
- `saveBacklog(type, tasks)`
  - Input: `type` (string `"specs"` or `"docs"`), `tasks` (array/dictionary of task objects as defined above).
  - Output: writes file; returns confirmation/void; the serialized text is persisted.
  - Behavior: resolves path from type, renders with `backlogIO.render` and writes deterministically to disk.
- `findTasksByPrefix(type, prefix) -> taskNames[]`
  - Input: `type` (string `"specs"` or `"docs"`), `prefix` (string).
  - Output: array of task names starting with `prefix`.
  - Behavior: loads and parses backlog, filters task names by prefix.
- `findTaskByFileName(type, fileName) -> taskName`
  - Input: `type` (string `"specs"` or `"docs"`), `fileName` (string, including extension).
  - Output: matching task name or null.
  - Behavior: loads and parses backlog, finds task by file name normalization.
- `findTasksByStatus(type, status) -> taskNames[]`
  - Input: `type` (string `"specs"` or `"docs"`), `status` (string from STATUS).
  - Output: array of task names with the given status.
  - Behavior: loads and parses backlog, filters tasks by status.
- `setStatus(type, relativeFilePath, status)`
  - Input: `type` (string `"specs"` or `"docs"`), `relativeFilePath` (string), `status` (string from STATUS).
  - Output: void; updates the status of the task.
  - Behavior: loads and parses backlog, sets the status of the task for the relativeFilePath, saves the backlog.
- `updateTask(type, relativeFilePath, updates)`
  - Input: `type` (string `"specs"` or `"docs"`), `relativeFilePath` (string), `updates` (object with properties to update).
  - Output: void; updates the task with the provided properties.
  - Behavior: loads and parses backlog, assigns the updates to the task, saves the backlog.
- `appendTask(type, relativeFilePath, initialContent)`
  - Input: `type` (string `"specs"` or `"docs"`), `relativeFilePath` (string), `initialContent` (string).
  - Output: void; adds a new task if it doesn't exist.
  - Behavior: loads and parses backlog, creates the task with the initial content as description, status `needs_work`, empty issues/options, empty resolution, saves the backlog.

## Exports
- `loadBacklog`
- `getTask`
- `recordIssue`
- `proposeFix`
- `approveResolution`
- `applyChanges`
- `saveBacklog`
- `findTasksByPrefix`
- `findTaskByFileName`
- `findTasksByStatus`
- `setStatus`
- `updateTask`
- `appendTask`
