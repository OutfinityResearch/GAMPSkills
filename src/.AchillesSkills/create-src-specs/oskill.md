# create-src-specs

## Intents
Generate file-level technical specifications (FDS) from existing DS files and the user prompt, creating one FDS per intended source file under `./docs/specs/src`.

## Preparation
1. Using context-loader load all global DS files that are only at the level `./docs/specs`, basically depth 0. Also include `./AGENTS.md`.

## Allowed Preparation Skills
- context-loader

## Instructions
1. Based on the DS files contents determine which fds files should be created in `./docs/specs/src`.
2. For each FDS file, choose which DS files you need as context and call fds-expert to generate the technical specification for that file.
3. Write the generated specification to `./docs/specs/src` using file-system.

- Create the source code folder structure as if you were implementing the project, but write FDS documents instead of code.
- Note: FDS stands for File Design Specification
- Note: FDS files should have the following naming convention: "name.mjs.md" where name is the intended file name to be used when the js code is finished

## Allowed Skills
- file-system
- fds-expert
