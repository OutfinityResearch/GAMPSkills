# create-tests-specs

## Intents
The create-tests-specs skill produces detailed functional design specifications for tests, describing assertions, inputs, outputs, and scenarios under the project's specs tests directory. It leverages DS and FDS specifications along with user prompts to define comprehensive test coverage without generating code.

## Preparation
1. Call context-loader to load all files under `./docs/specs` except `./docs/specs/tests`
2. Call context-loader again to load all files under `./docs/specs/src`

## Allowed Preparation Skills
- context-loader

## Instructions
1. Determine which test files need to be created based on the context provided and the user prompt.
2. For each planned file, call fds-expert and provide as context enough information to create the technical specification for that file.
3. Write the generated content using file-system `writeFile` to `./docs/specs/tests/<file-name>`.

Notes:
- Test files must have the .md extension.
- FDS stands for File Design Specification.
- FDS files use the naming convention `name.mjs.md` where `name` is the intended JS filename.
- FDS test files should only be written to `./docs/specs/tests`.
- Always write the FDS test files; do not stop at the planning phase.

## Allowed Skills
- file-system
- fds-expert
