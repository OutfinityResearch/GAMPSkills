# Context Module Specification

## Purpose
Reads files into a Map and builds the context assign output string. Handles include files, filter guards, maxFiles, and maxFileSize.

## Dependencies (Explicit Paths)
- `node:fs/promises`
- `node:crypto`
- `node:path`
- `./listing.mjs`
  - `buildMatcher(pattern: string) -> (value: string) => boolean`

## Public Exports
- `readRequestedFiles(filePaths: string[], readFiles: Map<string, string>, options: { dir?: string, filter?: string | null, maxFiles?: number | null, maxFileSize?: number | null }) -> Promise<void>`
- `readIncludeFiles(includePaths: string[] | null, readFiles: Map<string, string>, options: { dir?: string, maxFileSize?: number | null }) -> Promise<void>`
- `buildContextAssignString(readFiles: Map<string, string>) -> string`

## `readRequestedFiles(filePaths, readFiles, options)`
Reads LLM-requested files with filter and size guards.

Signature:
```
readRequestedFiles(filePaths: string[], readFiles: Map<string, string>, options: { dir?: string, filter?: string | null, maxFiles?: number | null, maxFileSize?: number | null }) -> Promise<void>
```

Parameters:
- `filePaths`: list of file paths (absolute or relative)
- `readFiles`: Map to mutate with `fullPath -> content/error`
- `options`: read guards and directory base

Returns:
- `Promise<void>`; errors are recorded in the Map, not thrown

Flow:
1. Build `filterMatcher` from `options.filter` (if set) via `buildMatcher()`
2. For each `filePath` in `filePaths`:
   - Break if `maxFiles` is set and `readFiles.size >= maxFiles`
   - Resolve `fullPath` with `resolve(dir || '.', filePath)` unless `filePath` is absolute
   - Skip if `readFiles` already has `fullPath`
   - If `filterMatcher` exists, test `basename(filePath)` and skip if no match
   - If `maxFileSize` is set: call `stat(fullPath)`; if `size > maxFileSize`, store skip message and continue
   - Call `readFile(fullPath, 'utf8')` and store content
   - On error: store `[Error reading file: <message>]`

## `readIncludeFiles(includePaths, readFiles, options)`
Reads include files before LLM selection, bypassing filter/maxFiles.

Signature:
```
readIncludeFiles(includePaths: string[] | null, readFiles: Map<string, string>, options: { dir?: string, maxFileSize?: number | null }) -> Promise<void>
```

Parameters:
- `includePaths`: list of file paths (absolute or relative)
- `readFiles`: Map to mutate with `fullPath -> content/error`
- `options`: `{ dir, maxFileSize }`

Returns:
- `Promise<void>`; errors are recorded in the Map, not thrown

Flow:
- Similar to `readRequestedFiles` but:
  - Does NOT check filter (include bypasses filter)
  - Does NOT check maxFiles (include files are always loaded)
  - Still respects `maxFileSize`

## `buildContextAssignString(readFiles)`
Builds the final context assign string from read files.

Signature:
```
buildContextAssignString(readFiles: Map<string, string>) -> string
```

Parameters:
- `readFiles`: Map of `fullPath -> content` entries

Returns:
- A newline-joined string of assigns; empty string if no files

Flow:
1. If `readFiles.size === 0` → return empty string
2. For each `[fullPath, content]` in readFiles:
   - Compute `relPath = relative(process.cwd(), fullPath).replace(/\\/g, '/')`
   - Compute `baseName` from `relPath` via `buildSafeBaseName()`
   - Compute `token` via `buildHereDocToken(content, `context-${randomUUID()}`)
   - Emit lines:
     - `@${baseName} assign "${relPath}"`
     - `@${baseName}Content assign`
     - `--begin-${token}--`
     - file content (if non-empty)
     - `--end-${token}--`
3. Return the joined string with `\n`

## Internal Functions
- `buildSafeBaseName(filePath, prefix = 'spec_')` — builds a safe identifier from a path
- `buildHereDocToken(content, base = 'context')` — ensures begin/end tokens do not collide with content

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
