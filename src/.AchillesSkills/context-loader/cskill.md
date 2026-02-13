# context-loader

## Summary
Loads relevant project file contents as structured context for an LLM. Provide a natural language description of what context is needed (e.g., "understand the authentication flow" or "all database models"). The skill iteratively reads files guided by LLM decisions until sufficient context is gathered.

## Input Format
- **prompt** (string): Natural language description of the context needed.
- **options** (key-value list, optional): Configuration options provided after `options:` as `key: value` pairs. If options cannot be parsed, defaults are used.
- **dependsOn** (string, optional): Dependency markers to enforce ordering; ignored by this skill.

Rules:
- First part (before `options:`) is always the prompt.
- Optional parameters must be provided after `options:` as `key: value` pairs. If parsing fails, the skill continues with defaults.
- Values with spaces or newlines must be wrapped in quotes.
- Repeat keys to pass multiple values (e.g., `include:`).
- `dependsOn:` can list multiple refs and is ignored by the parser.

Options (keys):
- **dir** (string): Base directory to search in. Default: `"."` (current directory).
- **filter** (string, glob): Filter files by name pattern (e.g., `"*.md"`, `"*.mjs"`). Only matching files appear in listing and are read. Default: no filter.
- **maxDepth** (number): Recursive listing depth relative to `dir`. Default: `2`.
- **exclude** (string, glob): Additional pattern to exclude files/directories by name (e.g., `"*.test.*"`). Default: no extra exclusions.
- **maxFiles** (number): Maximum total files to read across all iterations. Default: unlimited.
- **maxFileSize** (number, bytes): Skip files larger than this size. Default: no limit.
- **include** (string, repeatable): Force-include these files before the first LLM call, regardless of filter. Repeat `include:` for multiple files. Default: none.

Examples:
- "understand the authentication flow"
- "load all database models" options: dir: ./src filter: "*.ts" maxDepth: 4
- "find specification files" options: filter: "*.md" exclude: "*.test.*" maxFiles: 10
- "understand the backlog system" options: dir: ./src filter: "*.mjs" maxDepth: 3 include: "package.json" include: "tsconfig.json"
- "load project context" options: maxFileSize: 50000 maxFiles: 15

## Output Format
- **Type**: `string`
- **Success Example**:
  ```text
  @src/utils/helper.js assign
  --begin-context-123--
  // code here
  --end-context-123--
  @src/main.ts assign
  --begin-context-456--
  // code here
  --end-context-456--
  ```
- **Error Example**: "Error: No input provided for context-loader."

## Constraints
- Maximum 5 LLM-guided read iterations.
- Default directory listing depth is 2 (configurable via maxDepth).
- Directories always excluded from listing: node_modules, .git, dist, build, .next, coverage, .cache.
- All paths in output are relative to process.cwd().
- Filter acts as a guard: files requested by LLM that don't match the filter are not read.
- Include files bypass the filter but respect maxFileSize.
