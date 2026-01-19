# BacklogManager

## Description
BacklogManager orchestrates both project backlogs (`./specs_backlog.md` and `./docs_backlog.md`) while enforcing the standard section format (Name / Description / Status / Issues / Options / Resolution). It loads raw backlog text, parses it into structured sections, lets agents record issues and proposed fixes, applies user-approved resolutions via injected hooks, and writes the serialized result back. It keeps operations deterministic and context-limited by extracting only the needed section and preserving a stable, human-editable layout.

## Dependencies
- `backlogIO` (see `./BacklogManager/backlogIO.md`) — reading/writing files, parsing/rendering backlog sections, slicing/merging specific sections
- `backlogDomain` (see `./BacklogManager/backlogDomain.md`) — STATUS enum, models and validation for issues/proposals/resolutions, filters, ChangeQueue
- Node `fs/promises` — file I/O
- Node `path` — path resolution

## Main methods
- `loadBacklog(type) -> { sections, meta }`
  - Input: `type` (string `"specs"` or `"docs"` for backlog type).
  - Output: `{ sections, meta }` where `sections` is an array/dictionary of section objects keyed by file (fields: `name`, `description`, `status`, `issues[]`, `options[]`, `resolution`), and `meta` includes file info like `mtime`, `size`.
  - Behavior: resolves path from type, reads file, parses via `backlogIO.parse`, returns structured data for further operations.
- `getSection(fileKey) -> section`
  - Input: `fileKey` (string identifier for the target file, e.g., `docs/specs/src/foo/bar.md`).
  - Output: `section` object (`{ name, description, status, issues[], options[], resolution }`) or null if missing.
  - Behavior: fetches the section from the loaded `sections` store.
- `recordIssue(sectionRef, issue)`
  - Input: `sectionRef` (fileKey or direct section object), `issue` (raw object/string to be normalized; expects fields like `title`, `details?`, `status?`).
  - Output: updated section with appended normalized issue (`{ id, title, details?, status? }`).
  - Behavior: normalizes via `backlogDomain.normalizeIssue`, appends to Issues, preserves numbering.
- `proposeFix(sectionRef, proposal)`
  - Input: `sectionRef` (fileKey or section), `proposal` (raw string/object with `title`, optional `details`).
  - Output: updated section with appended option entry (`{ id, title, details? }`).
  - Behavior: normalizes and appends to Options, keeping stable numeric order.
- `approveResolution(sectionRef, resolutionString)`
  - Input: `sectionRef` (fileKey or section), `resolutionString` (string chosen by user).
  - Output: updated section with `resolution` set; may also adjust `status` based on domain rules.
  - Behavior: sets Resolution text; validates status compatibility (`ok`/`needs_work`) per `backlogDomain`.
- `applyChanges(sectionRef, approvedItems, hooks)`
  - Input: `sectionRef` (fileKey/section), `approvedItems` (array of issue/option IDs or objects selected for application), `hooks` (object with functions to call external skills, e.g., `{ applySpecFix, applyDocFix }`).
  - Output: updated section reflecting applied items, updated status/resolution, and an ordered list of executed changes (via `ChangeQueue`).
  - Behavior: sequences changes deterministically, calls hooks to enact fixes, updates section content accordingly.
- `saveBacklog(type, sections)`
  - Input: `type` (string `"specs"` or `"docs"`), `sections` (array/dictionary of section objects as defined above).
  - Output: writes file; returns confirmation/void; the serialized text is persisted.
  - Behavior: resolves path from type, renders with `backlogIO.render` and writes deterministically to disk.
- `findSectionsByPrefix(type, prefix) -> sectionNames[]`
  - Input: `type` (string `"specs"` or `"docs"`), `prefix` (string).
  - Output: array of section names starting with `prefix`.
  - Behavior: loads and parses backlog, filters section names by prefix.
- `findSectionByFileName(type, fileName) -> sectionName`
  - Input: `type` (string `"specs"` or `"docs"`), `fileName` (string, including extension).
  - Output: matching section name or null.
  - Behavior: loads and parses backlog, finds section by file name normalization.
- `findSectionsByStatus(type, status) -> sectionNames[]`
  - Input: `type` (string `"specs"` or `"docs"`), `status` (string from STATUS).
  - Output: array of section names with the given status.
  - Behavior: loads and parses backlog, filters sections by status.

## Exports
- `BacklogManager` (class)
