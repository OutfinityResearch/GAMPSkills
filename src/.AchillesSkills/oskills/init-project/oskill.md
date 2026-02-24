# init-project

## Intents
This skill initializes a fresh project by creating `./docs`, `./docs/specs`, `./docs/specs/src`, `./docs/specs/tests`, along with the root backlogs `./specs_backlog.backlog` and `./docs_backlog.backlog`. 
It will also create initial DS files with content derived from the user prompt.

## Preparation
1. Create initial DS files with relevant content in `./docs/specs` using ds-expert.
2. use context-loader to load those created files and return them as context in the final answer. do not use file-system to read the files.

- Note: Create 4-5 DS files max, named like `DS01-Vision.md`, `DS02-Architecture.md`, etc.

## Allowed Preparation Skills
- context-loader
- ds-expert
- file-system

## Instructions
1. Create directories: `./docs/specs/src`, `./docs/specs/tests`
2. Create files `./specs_backlog.backlog` and `./docs_backlog.backlog` using backlog-api createBacklog
3. For each DS generated call quality-expert with profile ds.
4. Write the result from step 3 to the same file path using file-system.
5. Get specLoader content using load-spec-loader and then write it to `./docs/specLoader.html` using file-system.
6. Add or update `./AGENTS.md` to include a short specs map and a note that all documents, code, HTML docs, and specs are in English (even if interactive communication is RO/EN).

- For any action that must run after a previous action, pass the previous action's result as a last parameter to the dependent action to enforce execution order.
  Example: @ds01 ds-expert "generate content for DS01"
           @writeDS01 file-system writeFile $ds01
           @ds02 ds-expert "generate content for DS02"
           @writeDS02 file-system writeFile $ds02 dependsOn: $writeDS01

## Allowed Skills
- file-system
- ds-expert
- backlog-api
- load-spec-loader
