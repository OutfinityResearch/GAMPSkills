# Context Loader - Main Entry Point Specification

## Purpose
Orchestrates the context-loading workflow: parses input, lists directories, force-reads include files, then runs the iterative LLM-guided file reading loop.

## Exports
- `action(context)` — single entry point, receives `{ llmAgent, promptText }`.

## Constants (Hardcoded)
- `MAX_ITERATIONS = 5` — maximum LLM loop iterations.

## Dependencies (Imports)
- `parseInput` from `./parser.mjs`
- `listDirectory` from `./listing.mjs`
- `readRequestedFiles`, `readIncludeFiles`, `buildContextXml` from `./context.mjs`
- `askLLMForFiles`, `buildConstraintsSection` from `./prompts.mjs`

## Flow
1. Call `parseInput(promptText)` → `{ prompt, options }`
2. Throw Error if `prompt` is empty
3. If `options.include` exists, call `readIncludeFiles(options.include, readFiles, options)` to force-load them before the first LLM call
4. Call `listDirectory(options)` → `string[]`, join with `\n` for tree text
5. Call `buildConstraintsSection(options)` → constraints string
6. Call `askLLMForFiles(llmAgent, prompt, treeText, null, constraints)` → initial response
7. Enter while loop: `!llmResponse.done && iteration < MAX_ITERATIONS`
   a. Increment iteration
   b. Break if `maxFiles` reached (`readFiles.size >= options.maxFiles`)
   c. Call `readRequestedFiles(llmResponse.files, readFiles, options)`
   d. Call `buildContextXml(readFiles)` → accumulated XML
   e. Call `askLLMForFiles(llmAgent, prompt, treeText, contextXml, constraints)`
8. Return `buildContextXml(readFiles)`

## Code Generation Guidelines
- Keep this file minimal — only orchestration logic
- All parsing, listing, reading, prompting is delegated to modules
- The only constant is MAX_ITERATIONS
- readFiles is a `Map<string, string>` shared across all steps
