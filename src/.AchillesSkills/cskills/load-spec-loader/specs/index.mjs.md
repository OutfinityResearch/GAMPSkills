# Load Spec Loader Skill - Implementation Specification

## Purpose
Returns the contents of the bundled `specsLoader.html` asset as a string so other skills can write it into the current working directory without needing to know the repo path.

## Dependencies (Native Libraries)
- `fs/promises`
- `url`
- `path`

## Public Exports
- `action() -> Promise<string>`

## `action()`
Loads `specsLoader.html` from the same directory as this module.

Signature:
```
action() -> Promise<string>
```

Returns:
- The full HTML file contents as a string

Throws:
- Any `readFile` error (no custom handling)

Implementation details:
- Resolves `specsLoader.html` relative to `import.meta.url`
- Uses:
  - `fileURLToPath(import.meta.url)`
  - `dirname(currentFile)`
  - `join(currentDir, 'specsLoader.html')`

## Code Generation Guidelines
- Resolve the module directory via `import.meta.url`
- Read the HTML asset from the same directory
- Return the full string contents without modification
