# init-project

## Intents
This skill initializes a fresh project by creating `./docs`, `./docs/specs`, `./docs/specs/src`, and `./docs/specs/tests`, along with the root backlogs `./specs_backlog.backlog` and `./docs_backlog.backlog`. It consumes a user prompt describing the intended project and seeds `./specs_backlog.backlog` with questions and option strings that reflect the prompt's complexity, including that the skill will create the initial DS files. The backlog questions should also ask about those DS files and whether to add more DS files, providing examples of possible additions.

## Instructions
By executing the allowed skills you must achieve the following results: 
- Create directories: `./docs`, `./docs/specs`, `./docs/specs/src`, `./docs/specs/tests`
- Create files `./specs_backlog.backlog` and `./docs_backlog.backlog` using backlog-io createBacklog
- Create initial DS files with relevant content in `./docs/specs`
- Generate multiple tasks for `./specs_backlog.backlog` with project-specific options based on the user prompt, regarding the initial DS files. You must write the exact names of the affected files in the task description. Do not use markdown for task description. A task must focus on a single aspect of the project. Add tasks using backlog-io addTask.
- Generate options (numbered list of strings) for each task created using as context the task Description and the user prompt and update the task using backlog-io addOptionsFromText. Options are possible solutions to the task and the user can choose only one. Ensure option generation outputs ONLY numbered lines (Ex: "1.", "2.", "3.") with no extra prose or headings. Use the taskId returned by addTask for addOptionsFromText (do not hard-code indices).

- Do not generate DS content on your own, use ds-expert skill for that, then use its result and backlog-io/file-system skills write that content to files.
- Make the prompt for ds-expert in such a way that you create the DS files one step at a time (generate content for file 1 → write to file 1 → generate content for file 2 → write to file 2)
- Each skill call handles only ONE operation. To perform multiple actions, call the same skill multiple times with different parameters.
- To ensure backlog content is persisted to disk, after all backlog-io addTask/addOptionsFromText calls, call backlog-io flush specs $lastOp where lastOp is the result of the last Op working with the backlog.

## Allowed Skills
- file-system
- backlog-io  
- ds-expert
