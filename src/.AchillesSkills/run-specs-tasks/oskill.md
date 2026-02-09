# run-specs-tasks

## Intents
This skill processes approved tasks from `./specs_backlog.backlog` and applies their resolutions to the corresponding specification files.

## Instructions

1. Load ready to run tasks using backlog-io getApprovedTasks.
2. Use file-system to list all files that end with .md (these are spec files).
3. Determine the affected file paths for each task. If a task targets multiple files, include it for each file it references.
4. For each affected file, read the file once, then use ds-expert or fds-expert with the file content plus all tasks descriptions and their resolutions that reference that file to generate the full updated content. 
5. Write the returned content to the same file with file-system writeFile before moving to any other file.
6. Mark each executed task as done using backlog-io markDone (use the task index from getApprovedTasks).
7. Call getApprovedTasks at the end of the plan to check for leftover tasks and re-execute the flow if you find any tasks.

If tasks have been executed say how many tasks have been executed.
Each file should be edited at most once per run if possible (aggregate tasks by file).
If no tasks are ready to run simply say that no tasks have been approved and end the execution.

## Allowed Skills
- backlog-io
- file-system
- ds-expert

## Loop
true
