# Context Loader - Main Entry Point Specification

## Purpose
Orchestrates the context-loading workflow: parses input, lists directories, force-reads include files, then runs the iterative LLM-guided file reading loop.

## Dependencies (Explicit Paths)
- `./parser.mjs`
  - `parseInput(promptText: string) -> { prompt: string, options: object, optionsRaw: string, parseError: Error | null }`
  - `applyDefaults(parsed: object) -> object`
- `./listing.mjs`
  - `listDirectory(options: object) -> Promise<string[]>`
- `./context.mjs`
  - `readRequestedFiles(filePaths: string[], readFiles: Map<string, string>, options: object) -> Promise<void>`
  - `readIncludeFiles(includePaths: string[] | null, readFiles: Map<string, string>, options: object) -> Promise<void>`
  - `buildContextAssignString(readFiles: Map<string, string>) -> string`
- `./prompts.mjs`
  - `askLLMForFiles(llmAgent: object, userRequest: string, directoryTree: string, currentContext: string | null, constraints: string) -> Promise<{ done: boolean, files: string[], reason: string }>`
  - `buildConstraintsSection(options: object) -> string`

## Exports
- `action(context: { llmAgent: object, promptText: string }) -> Promise<string>`

## Constants (Hardcoded)
- `MAX_ITERATIONS = 5` — maximum LLM loop iterations.

## Flow
1. Call `parseInput(promptText)` → `{ prompt, options, parseError }`
2. If `parseError` is set, replace options with `applyDefaults({})`
3. Throw Error if `prompt` is empty
4. If `options.include` exists, call `readIncludeFiles(options.include, readFiles, options)` to force-load them before the first LLM call
5. Call `listDirectory(options)` → `string[]`, join with `\n` for tree text
6. Call `buildConstraintsSection(options)` → constraints string
7. Call `askLLMForFiles(llmAgent, prompt, treeText, null, constraints)` → initial response
8. Enter while loop: `!llmResponse.done && iteration < MAX_ITERATIONS`
   a. Increment iteration
   b. Break if `maxFiles` reached (`readFiles.size >= options.maxFiles`)
   c. Call `readRequestedFiles(llmResponse.files, readFiles, options)`
   d. Call `buildContextAssignString(readFiles)` → accumulated context assigns
   e. Call `askLLMForFiles(llmAgent, prompt, treeText, contextAssigns, constraints)`
9. Return `buildContextAssignString(readFiles)`

## Code Generation Guidelines
- Keep this file minimal — only orchestration logic
- All parsing, listing, reading, prompting is delegated to modules
- The only constant is MAX_ITERATIONS
- readFiles is a `Map<string, string>` shared across all steps
- The loop passes context assigns (not XML) to follow-up prompts
