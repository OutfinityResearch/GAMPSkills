# init-project

## Intents
This skill initializes a fresh project by creating `./docs`, `./docs/specs`, `./docs/specs/src`, `./docs/specs/tests`, along with the root backlogs `./specs_backlog.backlog` and `./docs_backlog.backlog`. 
It will also create initial DS files with content derived from the user prompt. 
It will also seed `./specs_backlog.backlog` with tasks (regarding DS files) and options that resolve that task.

## Preparation
1. Create initial DS files with relevant content in `./docs/specs` using ds-expert.
2. return those files' content as context.

- Note: Create 4-5 DS files max, named like `DS001-Vision.md`, `DS002-Architecture.md`, etc.

## Allowed Preparation Skills
- context-loader
- ds-expert
- file-system

## Instructions
1. Create directories: `./docs`, `./docs/specs`, `./docs/specs/src`, `./docs/specs/tests`
2. Create files `./specs_backlog.backlog` and `./docs_backlog.backlog` using backlog-api createBacklog
3. Get specLoader content using load-spec-loader and then write it to `./docs/specLoader.html` using file-system.
4. Generate multiple tasks for `./specs_backlog.backlog` with project-specific options based on the user prompt, regarding the initial DS files (use them as context) using backlog-expert. 
5. Add tasks using backlog-api addTask.
6. Generate options for each task created using as context the task Description and the user prompt.
7. Add task options using backlog-api addOptionsFromText. Use the taskId returned by addTask for addOptionsFromText (do not hard-code indices).
8. Add or update `./AGENTS.md` to include a short specs map and a note that all documents, code, HTML docs, and specs are in English (even if interactive communication is RO/EN).

- Keep documents readable and concise; avoid excessive headings and bullet lists.
- Each skill call handles only ONE operation. To perform multiple actions, call the same skill multiple times with different parameters.
- For any action that must run after a previous action, pass the previous action's result as a last parameter to the dependent action to enforce execution order.
  Example: @createDir file-system createDirectory ./docs
           @createBacklog backlog-api createBacklog specs $createDir

## Allowed Skills
- file-system
- backlog-api
- backlog-expert
- load-spec-loader