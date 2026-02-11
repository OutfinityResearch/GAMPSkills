# init-project

## Intents
This skill initializes a fresh project by creating `./docs`, `./docs/specs`, `./docs/specs/src`, `./docs/specs/tests`, along with the root backlogs `./specs_backlog.backlog` and `./docs_backlog.backlog`. 
It will also create initial DS files with content derived from the user prompt. 
It will also seed `./specs_backlog.backlog` with tasks (regarding DS files) and options that resolve that task.

## Preparation
1. Create initial DS files with relevant content in `./docs/specs` using ds-expert.
2. return those files' content as context, one variable per file .


## Instructions
1. Create directories: `./docs`, `./docs/specs`, `./docs/specs/src`, `./docs/specs/tests`
2. Create files `./specs_backlog.backlog` and `./docs_backlog.backlog` using backlog-io createBacklog
3. Generate multiple tasks for `./specs_backlog.backlog` with project-specific options based on the user prompt, regarding the initial DS files (use them as context) using ds-expert. You must write the exact names of the affected files in the task description. Do not use markdown for task description. A task must focus on a single aspect of the project. 
4. Add tasks using backlog-io addTask.
5. Generate options (numbered list of strings) for each task created using as context the task Description and the user prompt. Options are possible solutions to the task and the user can choose only one. Ensure option generation outputs ONLY numbered lines (Ex: "1.", "2.", "3.") with no extra prose or headings.
6. Add task options using backlog-io addOptionsFromText. Use the taskId returned by addTask for addOptionsFromText (do not hard-code indices).

- Do not generate DS content on your own, use ds-expert skill for that, then use its result and backlog-io/file-system skills write that content to files.
- Make the prompt for ds-expert in such a way that you create the DS files one step at a time (generate content for file 1 → write to file 1 → generate content for file 2 → write to file 2)
- Each skill call handles only ONE operation. To perform multiple actions, call the same skill multiple times with different parameters.
- For any action that must run after a previous action, pass the previous action's result as a last parameter to the dependent action to enforce execution order.
  Example: @createDir file-system createDirectory ./docs
           @createBacklog backlog-io createBacklog specs $createDir

## Allowed Skills
- context-loader
- file-system
- backlog-io  
- ds-expert
