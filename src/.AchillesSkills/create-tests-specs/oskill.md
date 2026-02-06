# create-tests-specs

## Intents
The create-tests-specs skill produces detailed functional design specifications for tests, describing assertions, inputs, outputs, and scenarios under the project's specs tests directory. It leverages DS and FDS specifications along with user prompts to define comprehensive test coverage without generating code.

## Instructions
Unit test specs workflow:
1. Use file-system to list all files under `./docs/specs`.
2. Read every file under `./docs/specs/src` and build a shared FDS context.
3. Ask fds-expert to produce a plan: a list of unit test spec files to create, each with a short description of what to validate.
4. For each planned unit test file, call fds-expert with the FDS context plus the file name and description to generate the full spec content.
5. Write each generated unit test spec to `./docs/specs/tests` (one file per entry).

Behavior test specs workflow:
1. Use file-system to list all files under `./docs/specs`.
2. Read all DS and FDS files except those under `./docs/specs/tests` and build a shared DS + FDS context.
3. Ask fds-expert to produce a plan: a list of behavior test spec files to create, each with a short description (behavior tests only, not unit tests).
4. For each planned behavior test file, call fds-expert with the DS + FDS context plus the file name and description to generate the full spec content.
5. Write each generated behavior test spec to `./docs/specs/tests`.
6. After each behavior test spec is written, add the generated file name and description to the context for subsequent generations so fds-expert can avoid duplicates and continue consistently.

- Note: The behavior and unit tests flows are interchangeable, it all depends on what the user wants to do. If the user only wants one type of tests you will execute that flow. Otherwise, use both. If the user specifies only one file/folder to create tests for use the flows but you do not need to execute it fully, follows the user's instructions.
- Note: FDS stands for File Design Specification.
- Note: FDS files should have the following naming convention: "name.mjs.md" where name is the intended file name to be used when the js code is finished.
- Note: Unit tests are for functions within a single file, they have self-contained behavior.
- Note: Behavior tests require multiple source code files, they test a flow/scenario of the application
- Note: FDS tests files should only be written to `./docs/specs/tests`.
- Note: Always write create FDS test files, do not stop at the planning phase.

## Allowed Skills
- file-system
- fds-expert

## Loop
true