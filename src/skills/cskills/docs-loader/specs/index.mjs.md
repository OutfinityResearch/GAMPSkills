# docs-loader Skill - Implementation Specification

## Purpose
Loads a documentation file from the GAMPSkills `docs/` folder by base filename and returns its contents as a string.

## Dependencies (Native Libraries)
- `fs/promises`
- `url`
- `path`

## Public Exports
- `action(context) -> Promise<string>`

## `action(context)`
Reads a documentation file from the `docs/` directory located at the GAMPSkills package root.

Signature:
```
action({ promptText }) -> Promise<string>
```

Parameters:
- `promptText` (string): Base filename without extension.

Behavior:
- Trim `promptText` and ensure it is not empty.
- Reject filenames containing path separators (`/` or `\\`) or `..`.
- Build the docs path as: `<gampskills-root>/docs/<name>.md`.
- Read the file as UTF-8 and return its contents.

Returns:
- The file contents as a string.

Throws:
- "Error: No input provided for docs-loader." when `promptText` is empty.
- "Error: Invalid document name: <name>" when the name is unsafe.
- "Error: Documentation file not found: <name>.md" when the file does not exist.

Implementation details:
- Resolve the skill directory using `import.meta.url`.
- Compute the GAMPSkills root by walking up from `src/skills/cskills/docs-loader/src` to the package root.
- Construct the docs path using `path.join(rootDir, 'docs', `${name}.md`)`.

## Code Generation Guidelines
- Use `fileURLToPath(import.meta.url)` + `dirname` for the module directory.
- Use `path.resolve` to navigate up to the package root.
- Use `fs.promises.readFile` with `utf8` encoding.
