# Context Module Specification

## Purpose
Reads files into a Map and builds the `<context>` XML output string. Handles include files, filter guards, maxFiles, and maxFileSize.

## Exports
- `readRequestedFiles(filePaths, readFiles, options)` → `Promise<void>`
- `readIncludeFiles(includePaths, readFiles, options)` → `Promise<void>`
- `buildContextXml(readFiles)` → `string`

## Dependencies
- `fs/promises` (readFile, stat)
- `path` (resolve, extname, relative)
- `buildMatcher` from `./listing.mjs`

## `readRequestedFiles(filePaths, readFiles, options)` Flow
Options used: `{ maxFiles, maxFileSize, filter, dir }`

1. Build `filterMatcher` from `options.filter` (if set) via `buildMatcher()`
2. For each `filePath` in `filePaths`:
   a. If `maxFiles` is set and `readFiles.size >= maxFiles` → break
   b. If `filePath` already in `readFiles` → skip
   c. If `filterMatcher` exists: extract filename (last segment after `/`), skip if no match
   d. Resolve to absolute path via `resolve(filePath)`
   e. If `maxFileSize` is set: call `stat(fullPath)`, if `size > maxFileSize` → store skip message, continue
   f. Call `readFile(fullPath, 'utf8')`, store in `readFiles` Map
   g. On error → store error message string `[Error reading file: <message>]`

## `readIncludeFiles(includePaths, readFiles, options)` Flow
Options used: `{ maxFileSize }`

- Similar to `readRequestedFiles` but:
  - Does NOT check filter (include bypasses filter)
  - Does NOT check maxFiles (include files are always loaded)
  - Still respects maxFileSize

## `buildContextXml(readFiles)` Flow
1. If `readFiles.size === 0` → return `'<context>\n</context>'`
2. For each `[filePath, content]` in readFiles:
   a. Compute `relPath = relative(process.cwd(), resolve(filePath))`
   b. Compute `language = extname(filePath).replace('.', '')`
   c. Emit `<file path="<escaped relPath>" language="<ext>">`
   d. Emit `<content>` with content indented by 6 spaces
   e. Emit closing tags
3. Return joined string

## Internal Functions
- `indentContent(content, spaces)` — splits by `\n`, prepends spaces to each line
- `escapeXmlAttr(str)` — escapes `&`, `"`, `<`, `>` for XML attributes

## Key Behaviors
- Filter acts as a guard on `readRequestedFiles`: LLM-requested files that don't match filter are silently skipped
- Include files bypass filter but respect maxFileSize
- Paths in output XML are always relative to `process.cwd()`
- File read errors are stored as descriptive strings, not thrown
- maxFileSize uses `stat()` before `readFile()` to avoid loading large files into memory

## Code Generation Guidelines
- `readFiles` is a `Map<string, string>` passed by reference and mutated
- `buildMatcher` must be imported from `./listing.mjs` (not duplicated)
- XML paths must use `relative(process.cwd(), resolve(filePath))`
- Language is raw extension without dot (e.g., `ts`, `js`, `md`)
