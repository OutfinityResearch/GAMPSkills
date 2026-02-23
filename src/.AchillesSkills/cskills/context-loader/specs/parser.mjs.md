# Parser Module Specification

## Purpose
Parses the raw `promptText` string into a clean prompt and a structured options object. Options are provided as key-value pairs after the `options:` marker.

## Dependencies (Explicit Paths)
- `../../../../utils/optionsParser.mjs`
  - `parseKeyValueOptions(text: string, config: { allowedKeys: Set<string>, repeatableKeys?: Set<string> }) -> object`
- `../../../../utils/ArgumentResolver.mjs`
  - `stripDependsOn(input: string) -> string`

## Public Exports
- `parseInput(promptText: string) -> { prompt: string, options: object, optionsRaw: string, parseError: Error | null }`
- `buildDefaults() -> object`
- `applyDefaults(parsed: object) -> object`

## Input Format
```
<prompt text> options: key1: value1 key2: 42
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

## `parseInput(promptText)`
Parses prompt text and returns the prompt plus normalized options.

Signature:
```
parseInput(promptText: string) -> { prompt: string, options: object, optionsRaw: string, parseError: Error | null }
```

Parameters:
- `promptText`: raw input string

Returns:
- `{ prompt, options, optionsRaw, parseError }`, never throws

Flow:
1. If `promptText` is falsy/non-string → return `{ prompt: '', options: defaults, optionsRaw: '', parseError: null }`
2. Strip `dependsOn:` suffix via `stripDependsOn()`
3. Search for `options:` marker via regex `\boptions\s*:\s*`
4. If no `options:` found → return `{ prompt: trimmed_input, options: defaults, optionsRaw: '', parseError: null }`
5. Split text at `options:` marker: before = prompt, after = options text
6. Parse options text with `parseKeyValueOptions(optionsRaw, { allowedKeys, repeatableKeys })`
7. If parsing throws: return defaults and surface the error in `parseError`
8. Apply type normalization in `applyDefaults()`

## `buildDefaults()`
Returns a fresh defaults object.

Signature:
```
buildDefaults() -> object
```

## `applyDefaults(parsed)`
Merges parsed values over defaults with type coercion.

Signature:
```
applyDefaults(parsed: object) -> object
```

Normalization rules:
- `dir`: string, trimmed
- `filter`: string, trimmed
- `maxDepth`: parsed to number, must be > 0
- `exclude`: string, trimmed
- `maxFiles`: parsed to number, must be > 0
- `maxFileSize`: parsed to number, must be > 0
- `include`: accepts `string[]` or comma-separated string, normalized to `string[]`

## Code Generation Guidelines
- Parsing uses `parseKeyValueOptions` with:
  - `allowedKeys = KNOWN_OPTIONS`
  - `repeatableKeys = new Set(['include'])`
- Invalid options must be silently handled (fallback to defaults, never throw)
- Unknown keys are silently ignored by the parser
- `include` must handle both array and comma-separated string inputs
- `buildDefaults()` must return a fresh object each time (no shared references)
