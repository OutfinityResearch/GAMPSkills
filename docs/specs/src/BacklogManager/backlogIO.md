# backlogIO

## Description
`backlogIO` handles the I/O for backlog files (`specs_backlog.md`, `docs_backlog.md`): it reads/writes raw content, parses the standard structure (Name / Description / Status / Issues / Options / Resolution) into structured sections, renders back to text, and provides utilities to slice/merge only the needed section (context limiting). The goal is a stable, human-editable format with deterministic transforms.

## Dependencies
- Node `fs/promises` — file reads/writes
- Node `path` — path resolution

## Main methods
- `readBacklog(path) -> rawContent`
  - Input: `path` (string absolute/relative path to backlog file).
  - Output: `rawContent` (string with full file text).
  - Behavior: reads file contents without mutation.
- `writeBacklog(path, content)`
  - Input: `path` (string), `content` (string serialized backlog text).
  - Output: void/confirmation; persists content deterministically.
  - Behavior: writes exactly the provided string to disk.
- `parse(rawContent) -> sections`
  - Input: `rawContent` (string backlog text).
  - Output: `sections` (array/dictionary of section objects: `{ name, description, status, issues[], options[], resolution }`).
  - Behavior: recognizes Name/Description/Status/Issues/Options/Resolution blocks, builds structured data per file.
- `render(sections) -> string`
  - Input: `sections` (array/dictionary of structured sections).
  - Output: `string` (backlog text with ordered numeric lists for Issues/Options).
  - Behavior: serializes structured sections back to the stable backlog format.
- `sliceToSection(rawContent, fileKey) -> sectionText`
  - Input: `rawContent` (string), `fileKey` (string identifier for section).
  - Output: `sectionText` (string of only that section in backlog format).
  - Behavior: extracts the subsection matching `fileKey` to minimize context.
- `mergeSection(rawContent, sectionText, fileKey) -> newRaw`
  - Input: `rawContent` (full backlog text), `sectionText` (text of a single section), `fileKey` (string).
  - Output: `newRaw` (string with the section replaced/merged, other sections unchanged).
  - Behavior: swaps the target section in-place while preserving the rest of the file.

## Exports
- `readBacklog`
- `writeBacklog`
- `parse`
- `render`
- `sliceToSection`
- `mergeSection`
