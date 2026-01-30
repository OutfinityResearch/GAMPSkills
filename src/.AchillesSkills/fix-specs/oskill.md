# fix-specs

## Description
The fix-specs skill applies user-approved resolutions from the specs backlog to the actual specification files. It identifies approved backlog sections, modifies the corresponding files based on the resolutions, and updates the backlog to reflect completed changes, maintaining synchronization between plans and execution.

## Instructions
This skill processes approved tasks from `./specs_backlog.md` and applies their resolutions to the corresponding specification files. The workflow is:

1. Load the specs backlog and select tasks where `status` is `needs_work` and `Resolution` is non-empty.
2. For each selected task, read the target file identified in the task description.
3. Read the file using file-system to get its current content.
4. Provide the file content and the resolution text to `ds-expert` to produce updated file content.
5. Write the updated content back to the same file using `file-system`.
6. Update the backlog task status to `ok` using `backlog-io`.

Each step should be performed per task, and only tasks with non-empty resolutions are applied.

## Allowed Skills
- backlog-io
- file-system
- ds-expert
