# create-tests-specs

## Intents
The create-tests-specs skill produces detailed functional design specifications for tests, describing assertions, inputs, outputs, and scenarios under the project's specs tests directory. It leverages DS and FDS specifications along with user prompts to define comprehensive test coverage without generating code.

## Preparation
1. Call context-loader to load all files under `./docs/specs` and `./docs/specs/src`  except `./docs/specs/tests`. also include `./AGENTS.md`.

## Allowed Preparation Skills
- context-loader

## Instructions
1. Determine which test files need to be created based on the context provided and the user prompt.
2. For each planned file, call fds-expert and provide as context enough information to create the technical specification for that file.
3. This step verifies the generated content. Call quality-expert with the result from step 2, profile fds and provide as context the same one from step 2. 
4. Write the result from step 3 using file-system `writeFile` to `./docs/specs/tests/<file-name>`.
5. As a final step, using project-manifest-expert update `./AGENTS.md` once with the paths of the files created, add any extra general relevant information for the project.

Notes:
- Test files must have the .md extension.
- FDS stands for File Design Specification.
- FDS files use the naming convention `name.mjs.md` where `name` is the intended JS filename.
- FDS test files should only be written to `./docs/specs/tests`.
- Always write the FDS test files; do not stop at the planning phase.

## Allowed Skills
- file-system
- fds-expert
- create-tests-specs,
- project-manifest-expert
