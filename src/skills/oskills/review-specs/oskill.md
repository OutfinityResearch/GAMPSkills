# review-specs

## Intents
The review-specs skill analyzes existing specification files for gaps, inconsistencies, errors, and areas needing improvement. It examines all markdown files under the project's specs directory, records findings as issues and proposed fixes in the specs backlog.

## Preparation

1. Load files that are mentioned in the user request, if none are mentioned load all spec files under `./docs/specs` (only .md files) using context-loader.

- Note: always load `./AGENTS.md`.

## Allowed Preparation Skills
- context-loader

## Instructions

1. Determine internally which files have problems.
2. For each file that has problems, call backlog-expert once with the file content and the detected problem to generate task descriptions.
3. Add all generated tasks to the specs backlog using backlog-api addTasksFromText.
4. For each added task ID, call backlog-expert again with the task description plus only the relevant spec file contents (planner decides which files are relevant) to generate numbered options (1., 2., 3. only, no extra prose).
5. Add the generated options to the task using backlog-api addOptionsFromText.

## Allowed Skills
- file-system
- backlog-api
- backlog-expert
