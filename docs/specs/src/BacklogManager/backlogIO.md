# backlogIO

## Description
`backlogIO` handles the I/O for backlog files (`specs_backlog.md`, `docs_backlog.md`): it reads/writes raw content, parses the standard structure (Name / Description / Status / Issues / Options / Resolution) into structured tasks, renders back to text, and provides utilities to slice/merge only the needed task (context limiting). The goal is a stable, human-editable format with deterministic transforms.

## Dependencies
- Node `fs/promises` — file reads/writes
- Node `path` — path resolution

## Backlog Format
The backlog files use a markdown format with tasks for each file. Each task follows this structure:

```
### File: relative/path/to/file.ext

**Description:** Brief description of the file's purpose or the issue.

**Status:** ok | needs_work | blocked

**Issues:**
1. Issue title
   Additional details...
2. Another issue...

**Options:**
1. Proposed fix title
   Details of the fix...
2. Alternative fix...

**Resolution:** Approved resolution text or empty if not resolved.
```

- File paths are relative to the project root.
- Status values: `ok`, `needs_work`, `blocked`.
- Issues and Options are numbered lists with optional details indented.

This format ensures human readability and deterministic parsing.

## Main methods
- `readBacklog(path) -> rawContent`
  - Input: `path` (string absolute/relative path to backlog file).
  - Output: `rawContent` (string with full file text).
  - Behavior: reads file contents without mutation.
- `writeBacklog(path, content)`
  - Input: `path` (string), `content` (string serialized backlog text).
  - Output: void/confirmation; persists content deterministically.
  - Behavior: writes exactly the provided string to disk.
- `parse(rawContent) -> tasks`
  - Input: `rawContent` (string backlog text).
  - Output: `tasks` (array/dictionary of task objects: `{ name, description, status, issues[], options[], resolution }`).
  - Behavior: recognizes Name/Description/Status/Issues/Options/Resolution blocks, builds structured data per file.
- `render(tasks) -> string`
  - Input: `tasks` (array/dictionary of structured tasks).
  - Output: `string` (backlog text with ordered numeric lists for Issues/Options).
  - Behavior: serializes structured tasks back to the stable backlog format.
- `sliceToTask(rawContent, fileKey) -> taskText`
  - Input: `rawContent` (string), `fileKey` (string identifier for task).
  - Output: `taskText` (string of only that task in backlog format).
  - Behavior: extracts the subtask matching `fileKey` to minimize context.
- `mergeTask(rawContent, taskText, fileKey) -> newRaw`
  - Input: `rawContent` (full backlog text), `taskText` (text of a single task), `fileKey` (string).
  - Output: `newRaw` (string with the task replaced/merged, other tasks unchanged).
  - Behavior: swaps the target task in-place while preserving the rest of the file.

## Exports
- `readBacklog`
- `writeBacklog`
- `parse`
- `render`
- `sliceToTask`
- `mergeTask`
