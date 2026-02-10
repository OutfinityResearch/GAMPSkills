# Parser Module Specification

## Purpose
Parses the raw `promptText` string into a clean prompt and a structured options object. Options are provided as a JSON object after the `options:` marker.

## Exports
- `parseInput(promptText)` → `{ prompt: string, options: object }`

## Input Format
```
<prompt text> options: {"key1": "value1", "key2": 42}
```
Or without options:
```
<prompt text>
```

## Known Options
```javascript
const KNOWN_OPTIONS = new Set([
    'dir', 'filter', 'maxDepth', 'exclude', 'maxFiles', 'maxFileSize', 'include',
]);
```

## Default Options Object
```javascript
{
    dir: '.',
    filter: null,
    maxDepth: 2,
    exclude: null,
    maxFiles: null,
    maxFileSize: null,
    include: null,
}
```

## Parsing Flow
1. If `promptText` is falsy/non-string → return `{ prompt: '', options: defaults }`
2. Strip `dependsOn:` suffix (case-insensitive) via regex `\bdependsOn\s*:\s*`
3. Search for `options:` marker (case-insensitive) via regex `\boptions\s*:\s*`
4. If no `options:` found → return `{ prompt: trimmed_input, options: defaults }`
5. Split text at `options:` marker: before = prompt, after = JSON text
6. Extract JSON object from text via regex `\{[\s\S]*\}`
7. Parse with `JSON.parse()`, fallback to empty object on error
8. Apply type normalization in `applyDefaults()`:
   - `dir`: string, trimmed
   - `filter`: string, trimmed
   - `maxDepth`: parsed to number, must be > 0
   - `exclude`: string, trimmed
   - `maxFiles`: parsed to number, must be > 0
   - `maxFileSize`: parsed to number, must be > 0
   - `include`: accepts both `string[]` and comma-separated string, normalized to `string[]`

## Internal Functions
- `buildDefaults()` — returns fresh defaults object
- `applyDefaults(parsed)` — merges parsed JSON values over defaults with type coercion
- `stripDependsOn(input)` — strips `dependsOn: ...` suffix

## Code Generation Guidelines
- JSON parsing is the core mechanism — no custom tokenizer needed
- Invalid JSON must be silently handled (fallback to defaults, never throw)
- Unknown keys in JSON are silently ignored
- `include` must handle both array and comma-separated string inputs
- `buildDefaults()` must return a fresh object each time (no shared references)
