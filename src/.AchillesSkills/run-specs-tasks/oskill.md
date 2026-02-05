# run-specs-tasks

## Description
The run-specs-tasks skill applies user-approved resolutions from the specs backlog to the actual specification files. It identifies approved backlog sections, modifies the corresponding files based on the resolutions, and updates the backlog to reflect completed changes, maintaining synchronization between plans and execution.

## Instructions
This skill processes approved tasks from `./specs_backlog.backlog` and applies their resolutions to the corresponding specification files. The workflow is:

1. Load ready to run tasks using backlog-io getApprovedTasks.
2. Use file-system to list all files that end with .md (these are spec files).
3. Determine the affected file paths for each task. If a task targets multiple files, include it for each file it references.
4. For each file group, read the file once, then use ds-expert or fds-expert with the file content plus all tasks/resolutions for that file to generate the full updated content. The ds-expert/fds-expert prompt must instruct: output ONLY the updated file content with no preamble, no commentary, and no markdown fences. Immediately after each ds-expert/fds-expert call, write the returned content to the same file with file-system writeFile before moving to any other file.
5. Mark each executed task as done using backlog-io markDone (use the task index from getApprovedTasks).

Do not call getApprovedTasks at the end of the plan, just say all tasks have been executed.
Each file should be edited at most once per run (aggregate tasks by file).
If no tasks are ready to run simply say that no tasks have been approved and end the execution.
## Allowed Skills
- backlog-io
- file-system
- ds-expert

## Loop
true
