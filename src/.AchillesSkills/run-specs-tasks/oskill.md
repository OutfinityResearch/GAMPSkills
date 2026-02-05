# run-specs-tasks

## Description
The run-specs-tasks skill applies user-approved resolutions from the specs backlog to the actual specification files. It identifies approved backlog sections, modifies the corresponding files based on the resolutions, and updates the backlog to reflect completed changes, maintaining synchronization between plans and execution.

## Instructions
This skill processes approved tasks from `./specs_backlog.backlog` and applies their resolutions to the corresponding specification files. The workflow is:

1. Load ready to run tasks using backlog-io getApprovedTasks.
2. Use file-system to list all files that end with .md (these are spec files).
3. Determine the affected file paths for each task. If a task targets multiple files, include it for each file it references.
4. For each file group, read the file once, then use ds-expert or fds-expert with the file content plus all tasks/resolutions for that file to generate the full updated content, then write the new content.
5. Mark each applied task done using backlog-io markDone (use the task index from getApprovedTasks).
6. Call backlog-io flush specs after all updates are written.

Each file should be edited at most once per run (aggregate tasks by file).

## Allowed Skills
- backlog-io
- file-system
- ds-expert

## Loop
true
