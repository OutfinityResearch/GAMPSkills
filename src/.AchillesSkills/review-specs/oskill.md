# review-specs

## Intents
The review-specs skill analyzes existing specification files for gaps, inconsistencies, errors, and areas needing improvement. It examines all markdown files under the project's specs directory, records findings as issues and proposed fixes in the specs backlog.

## Preparation

1. Load all spec files under `./docs/specs` (only .md files) and `./AGENTS.md` using context-loader.

## Allowed Preparation Skills
- context-loader

## Instructions

1. Call backlog-expert once with the context of all spec files to generate multiple task descriptions.
2. Add all generated tasks to the specs backlog using backlog-api addTasksFromText.
3. For each added task ID, call backlog-expert again with the task description plus only the relevant spec file contents (planner decides which files are relevant) to generate numbered options (1., 2., 3. only, no extra prose).
4. Add the generated options to the task using backlog-api addOptionsFromText.

## Allowed Skills
- file-system
- backlog-api
- backlog-expert
