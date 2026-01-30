# fix-specs

## Description
The fix-specs skill applies user-approved resolutions from the specs backlog to the actual specification files. It identifies approved backlog sections, modifies the corresponding files based on the resolutions, and updates the backlog to reflect completed changes, maintaining synchronization between plans and execution.

## Instructions
This skill processes approved tasks from `./specs_backlog.md` and applies their resolutions to the corresponding specification files. The workflow is:

1. Load the specs backlog and select tasks where `status` is `needs_work` and `Resolution` is non-empty.
2. For each selected task, read the `Affected Files` list from the backlog entry.
3. For each affected file:
   - Read the file content using `file-system`.
   - Extract its `# Dependencies` (or `## Dependencies`) list and read those dependency files as read-only context.
   - Provide the primary file content, dependency context, and the resolution text to `ds-expert` to produce updated file content.
   - Write the updated content back to the same file using `file-system`.
4. After all affected files are updated, set the backlog task status to `ok` using `backlog-io`.

Each step should be performed per task, and only tasks with non-empty resolutions are applied.

## Allowed Skills
- backlog-io
- file-system
- ds-expert
