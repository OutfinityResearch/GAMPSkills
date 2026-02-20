# Context Module Specification

## Purpose
Reads files into a Map and builds the context assign output string. Handles include files, filter guards, maxFiles, and maxFileSize.

## Dependencies (Explicit Paths)
- `node:fs/promises`
- `node:crypto`
- `node:path`
- `./listing.mjs`
  - `buildMatcher(pattern: string) -> (value: string) => boolean`

## Exports
- `readRequestedFiles(filePaths: string[], readFiles: Map<string, string>, options: { dir?: string, filter?: string | null, maxFiles?: number | null, maxFileSize?: number | null }) -> Promise<void>`
- `readIncludeFiles(includePaths: string[] | null, readFiles: Map<string, string>, options: { dir?: string, maxFileSize?: number | null }) -> Promise<void>`
- `buildContextAssignString(readFiles: Map<string, string>) -> string`

## `readRequestedFiles(filePaths, readFiles, options)` Flow
Options used: `{ maxFiles, maxFileSize, filter, dir }`

1. Build `filterMatcher` from `options.filter` (if set) via `buildMatcher()`
2. For each `filePath` in `filePaths`:
   a. If `maxFiles` is set and `readFiles.size >= maxFiles` → break
   b. If `filePath` already in `readFiles` → skip
   c. If `filterMatcher` exists: extract filename (last segment after `/`), skip if no match
   d. Resolve to absolute path via `resolve(dir || '.', filePath)` unless `filePath` is already absolute
   e. If `maxFileSize` is set: call `stat(fullPath)`, if `size > maxFileSize` → store skip message, continue
   f. Call `readFile(fullPath, 'utf8')`, store in `readFiles` Map
   g. On error → store error message string `[Error reading file: <message>]`

## `readIncludeFiles(includePaths, readFiles, options)` Flow
Options used: `{ maxFileSize, dir }`

- Similar to `readRequestedFiles` but:
  - Does NOT check filter (include bypasses filter)
  - Does NOT check maxFiles (include files are always loaded)
  - Still respects maxFileSize

## `buildContextAssignString(readFiles)` Flow
1. If `readFiles.size === 0` → return empty string
2. For each `[filePath, content]` in readFiles:
   a. Compute `relPath = relative(process.cwd(), resolve(filePath))`
   b. Compute `baseName` from `relPath` via `buildSafeBaseName()`
   c. Compute `token` via `buildHereDocToken(content, `context-${randomUUID()}`)
   d. Emit lines:
      - `@${baseName} assign "${relPath}"`
      - `@${baseName}Content assign`
      - `--begin-${token}--`
      - file content (if non-empty)
      - `--end-${token}--`
3. Return the joined string with `\n`

## Internal Functions
- `buildSafeBaseName(filePath, prefix = 'spec_')`
- `buildHereDocToken(content, base = 'context')`

## Key Behaviors
- Filter acts as a guard on `readRequestedFiles`: LLM-requested files that don't match filter are silently skipped
- Include files bypass filter but respect maxFileSize
- Paths in output are always relative to `process.cwd()`
- File read errors are stored as descriptive strings, not thrown
- maxFileSize uses `stat()` before `readFile()` to avoid loading large files into memory

## Code Generation Guidelines
- `readFiles` is a `Map<string, string>` passed by reference and mutated
- `buildMatcher` must be imported from `./listing.mjs` (not duplicated)
- Context assigns must use relative paths from `process.cwd()`
- Here-doc tokens must avoid collisions with content (keep incrementing if collision detected)
