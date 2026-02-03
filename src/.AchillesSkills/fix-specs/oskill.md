# fix-specs

## Description
The fix-specs skill applies user-approved resolutions from the specs backlog to the actual specification files. It identifies approved backlog sections, modifies the corresponding files based on the resolutions, and updates the backlog to reflect completed changes, maintaining synchronization between plans and execution.

## Instructions
This skill processes approved tasks from `./specs_backlog.md` and applies their resolutions to the corresponding specification files. The workflow is:

1. Load the specs backlog and select tasks that have a non-empty `Resolution` (these are ready to apply).
2. Use file-system to list all files that end with .md (these are spec files)
3. For each selected task, use ds-expert or fds-expert and the list of files to produce a new list of files that need to be worked on.
4. For each file in that list, use file-system to read it, use ds/fds-expert, task description, resolution and all previously generated content to create a new file content, then write the new content.
5. Move the task to History using `backlog-io`.

Each step should be performed per task, and only tasks with non-empty resolutions are applied.

## Allowed Skills
- backlog-io
- file-system
- ds-expert

## Loop
true
