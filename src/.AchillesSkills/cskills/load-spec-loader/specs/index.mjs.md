# Load Spec Loader Skill - Implementation Specification

## Purpose
The load-spec-loader skill provides the contents of a bundled `specsLoader.html` asset so that other skills can write it into the current working directory without needing access to the source repository path.

## Capabilities
- Returns the full HTML content of `specsLoader.html` as a string
- Works independently of the current working directory

## Input Contract
- The context object may include `promptText`, but this skill ignores it.

## Output Contract
- Returns a string containing the full HTML file contents
- Throws on file read errors

## Implementation Details

### Asset Resolution
The skill resolves the asset path relative to its own module file, using `import.meta.url`:
1. Convert `import.meta.url` to a filesystem path
2. Resolve the current directory
3. Read `specsLoader.html` from that directory

### Hardcoded Asset Path (Relative)
`./specsLoader.html`

### LLM Interaction
- None (no LLM calls)

## Dependencies
- Node.js `fs/promises`, `url`, and `path`

## Code Generation Guidelines
When regenerating this skill:
1. Resolve the module directory via `import.meta.url`
2. Read the HTML asset from the same directory
3. Return the full string contents without modification
