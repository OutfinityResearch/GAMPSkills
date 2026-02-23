# Listing Module Specification

## Purpose
Lists directory contents recursively with configurable depth, filter, and exclude patterns.

## Dependencies (Explicit Paths)
- `node:fs/promises`
- `node:path`

## Public Exports
- `listDirectory(options: { dir?: string, filter?: string | null, maxDepth?: number, exclude?: string | null }) -> Promise<string[]>` — flat array of relative paths
- `buildMatcher(pattern: string) -> (value: string) => boolean` — glob-to-regex matcher

## Constants (Hardcoded)
```javascript
const EXCLUDED_DIRS = new Set([
    'node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.cache',
]);
```

## `listDirectory(options)`
Recursively lists directory entries based on options.

Signature:
```
listDirectory(options: { dir?: string, filter?: string | null, maxDepth?: number, exclude?: string | null }) -> Promise<string[]>
```

Parameters:
- `dir`: base directory (default '.')
- `filter`: optional glob-like pattern for files
- `maxDepth`: recursion depth (default 2)
- `exclude`: optional glob-like pattern for entries

Returns:
- `Promise<string[]>` of Unix-style relative paths

Flow:
1. Destructure options: `{ dir = '.', filter = null, maxDepth = 2, exclude = null }`
2. Build matchers: `filterMatcher` from `filter`, `excludeMatcher` from `exclude` (both nullable)
3. Resolve `dir` to absolute path via `resolve(dir)`
4. Determine if default exclusions should apply via `shouldApplyExclusions(dir)`:
   - Split `dir` path into segments
   - If any segment matches an entry in `EXCLUDED_DIRS`, exclusions are disabled
5. Recursive walk starting at depth 1:
   - Stop if `depth > maxDepth`
   - Try `readdir(currentDir, { withFileTypes: true })`, silently skip on error
   - For each entry:
     - Skip if exclusions are active AND entry name is in `EXCLUDED_DIRS`
     - Skip if entry is a hidden directory (starts with `.`)
     - Skip if `excludeMatcher` matches entry name
     - If directory: push to entries, recurse deeper
     - If file: skip if `filterMatcher` exists and doesn't match entry name, otherwise push
6. Return flat array of relative paths (relative to `dir`)

## `buildMatcher(pattern)`
Builds a glob-like matcher for a single pattern.

Signature:
```
buildMatcher(pattern: string) -> (value: string) => boolean
```

Parameters:
- `pattern`: glob-like string with `*` and `?` wildcards

Returns:
- A predicate function that tests a value string

Logic:
- If pattern is falsy → return `() => true`
- Escape regex special characters: `.+^${}()|[]\`
- Replace `*` → `.*`
- Replace `?` → `.`
- Wrap in `^...$` anchors

## Internal Functions
- `shouldApplyExclusions(dir: string) -> boolean`

## Key Behaviors
- `filter` applies only to files, not directories (directories are always traversed)
- `exclude` applies to both files and directories by name
- Hidden directories (name starts with `.`) are always skipped
- Unreadable directories are silently skipped (no error thrown)
- Paths use `/` separator (Unix-style relative paths)
- If `dir` targets an excluded directory (e.g., `node_modules`, `dist`), default exclusions are disabled for the entire walk
- `include` files (handled by context.mjs) bypass listing entirely and read directly

## Code Generation Guidelines
- EXCLUDED_DIRS must match the hardcoded set exactly
- `buildMatcher` must be exported (used by context.mjs for filter guard)
- Filter = inclusion pattern on files; Exclude = exclusion pattern on entries
- Always resolve `dir` before walking
