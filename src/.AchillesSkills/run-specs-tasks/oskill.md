# run-specs-tasks

## Intents
This skill processes approved tasks from `./specs_backlog.backlog` and applies their resolutions to the corresponding specification files.

## Preparation 
1. Load ready to run tasks using backlog-api getApprovedTasks.
2. Use context-loader to load AGENTS.md, list all spec files in `./docs/specs` and then read them.
3. Store tasks and files as separate variables.

## Allowed Preparation Skills
- context-loader
- backlog-api

## Instructions

1. Determine the affected file paths for each task. If a task targets multiple files, include it for each file it references.
2. For each affected file, use ds-expert or fds-expert with the file content plus all tasks descriptions and their resolutions that reference that file to generate the full updated content. 
3. Write the returned content to the same file with file-system writeFile before moving to any other file.
4. Mark each executed task as done using backlog-api markDone (use the task index from getApprovedTasks).
5. Call getApprovedTasks at the end of the plan to check for leftover tasks and re-execute the flow if you find any tasks.

If tasks have been executed list which ones (by index).
Each file should be edited at most once per run if possible (aggregate tasks by file).
If no tasks are ready to run simply say that no tasks have been approved and end the execution.

## Allowed Skills
- backlog-api
- file-system
- ds-expert
