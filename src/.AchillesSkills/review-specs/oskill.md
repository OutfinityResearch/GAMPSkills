# review-specs

## Intents
The review-specs skill analyzes existing specification files for gaps, inconsistencies, errors, and areas needing improvement. It examines all markdown files under the project's specs directory, records findings as issues and proposed fixes in the specs backlog.

## Instructions
The workflow is:
1. Use file-system listDirectory to list all spec files under `./docs/specs` (only .md files).
2. Read each spec file and collect the full contents.
3. Call ds-expert once with the combined context of all spec files to generate multiple task descriptions as a numbered list (1., 2., 3. only), one task per line, no extra prose.
4. Add all generated tasks to the specs backlog using backlog-io addTasksFromText.
5. For each added task ID, call ds-expert again with the task description plus only the relevant spec file contents (planner decides which files are relevant) to generate numbered options (1., 2., 3. only, no extra prose).
6. Add the generated options to the task using backlog-io addOptionsFromText.
7. Call backlog-io flush specs after all tasks and options are added.

## Allowed Skills
- file-system
- backlog-io
- ds-expert

## Loop
true