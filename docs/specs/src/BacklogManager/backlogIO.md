# backlogIO

## Description
`backlogIO` handles the I/O for backlog files (`specs_backlog.md`, `docs_backlog.md`): it reads/writes raw content, parses the standard structure (Task Id / Description / Status / Options / Resolution) into structured tasks, renders back to text, and provides utilities to slice/merge only the needed task (context limiting). The goal is a stable, human-editable format with deterministic transforms.

## Dependencies
- Node `fs/promises` — file reads/writes

## Backlog Format
The backlog files use a markdown format with tasks for each file. Each task follows this structure:

```
## 1

**Description:** Brief description of the task or requested change.

**Status:** ok | needs_work | blocked

**Affected Files:**
- docs/specs/DS01.md
- docs/specs/src/moduleA.md

**Options:**
1. Proposed fix title
   Details of the fix...
2. Alternative fix...

**Resolution:** Approved resolution text or empty if not resolved.
```

- Task ids are numeric and assigned internally.
- Status values: `ok`, `needs_work`, `blocked`.
- Affected Files are a bullet list of files to be edited for the task.
- Options are numbered lists with optional details indented, but the header is always present even when no items are listed.

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
  - Output: `tasks` (dictionary of task objects keyed by numeric id: `{ id, description, status, affectedFiles[], options[], resolution }`).
  - Behavior: recognizes task id/Description/Status/Affected Files/Options/Resolution blocks, builds structured data per task.
- `render(tasks) -> string`
  - Input: `tasks` (dictionary of structured tasks).
  - Output: `string` (backlog text with ordered numeric lists for Options).
  - Behavior: serializes structured tasks back to the stable backlog format, always including the Affected Files and Options headers.
- `sliceToTask(rawContent, taskId) -> taskText`
  - Input: `rawContent` (string), `taskId` (numeric task identifier).
  - Output: `taskText` (string of only that task in backlog format).
  - Behavior: extracts the subtask matching `taskId` to minimize context.
- `mergeTask(rawContent, taskText, taskId) -> newRaw`
  - Input: `rawContent` (full backlog text), `taskText` (text of a single task), `taskId` (numeric id).
  - Output: `newRaw` (string with the task replaced/merged, other tasks unchanged).
  - Behavior: swaps the target task in-place while preserving the rest of the file.

## Exports
- `readBacklog`
- `writeBacklog`
- `parse`
- `render`
- `sliceToTask`
- `mergeTask`
