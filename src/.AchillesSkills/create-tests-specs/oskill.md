# create-tests-specs

## Intents
The create-tests-specs skill produces detailed functional design specifications for tests, describing assertions, inputs, outputs, and scenarios under the project's specs tests directory. It leverages DS and FDS specifications along with user prompts to define comprehensive test coverage without generating code.

## Instructions
Adaptive context + context tiering workflow:
1. Use file-system to list directories and files:
   - `listDirectory ./docs/specs`
   - `listDirectory ./docs/specs/src`
   - `listDirectory ./docs/specs/tests` (only to exclude already-generated tests)
2. Decide the minimal context needed based on the user prompt:
   - If the prompt is specific, read only the relevant DS/FDS files.
   - If the prompt is vague, start with global DS files and then add FDS files that match the topic.
3. Apply context tiering in this order, stopping as soon as the plan can be created:
   - Tier 1: DS files in `./docs/specs` that explain vision/core features.
   - Tier 2: FDS files in `./docs/specs/src` relevant to the prompt.
   - Tier 3: Additional FDS files only if tiers 1-2 are insufficient.
4. Build the test plan:
   - Call fds-expert once to produce a list of test spec files to create.
   - Each entry must include a file name and a short description.
5. Generate each test spec file, one by one:
   - For each planned file, call fds-expert with the selected context plus the file name + description.
   - Write the generated content using file-system `writeFile` to `./docs/specs/tests/<file-name>`.
   - After each write, append the generated file name + description to the shared context for subsequent generations.

Notes:
- Test files must have the .md extension.
- FDS stands for File Design Specification.
- FDS files use the naming convention `name.mjs.md` where `name` is the intended JS filename.
- FDS test files should only be written to `./docs/specs/tests`.
- Always write the FDS test files; do not stop at the planning phase.

## Allowed Skills
- file-system
- fds-expert

## Loop
true
