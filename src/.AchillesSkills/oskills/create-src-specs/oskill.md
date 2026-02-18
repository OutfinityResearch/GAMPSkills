# create-src-specs

## Intents
Generate file-level technical specifications (FDS) from existing DS files and the user prompt, creating one FDS per intended source file under `./docs/specs/src`.

## Preparation
1. Using context-loader load all global DS files that are only at the level `./docs/specs`, basically depth 0.
2. Call fds-planner with the DS context to generate the FDS plan (file paths and dependencies).
3. Write the plan to `./docs/specs/src/FDS_MANIFEST.md` using file-system.
4. Use context-loader to load `./docs/specs/src/FDS_MANIFEST.md` and return it as preparation context.

## Allowed Preparation Skills
- context-loader
- file-system
- fds-planner

## Instructions
1. Use `./docs/specs/src/FDS_MANIFEST.md` as the single source of truth for which FDS files to create and what they depend on.
2. For each FDS file listed in the manifest, using the DS files context and the manifest call fds-expert to generate the technical specification for that file.
3. Call quality-expert for evaluation with the generated content, use profile fds and provide as context the same DS context used at step 2 plus the manifest and any FDS content generated so far.
4. Write the generated specification to `./docs/specs/src` using file-system.

- Create the source code folder structure as if you were implementing the project, but write FDS documents instead of code.
- Note: FDS stands for File Design Specification
- Note: FDS files should have the following naming convention: "name.mjs.md" where name is the intended file name to be used when the js code is finished

## Allowed Skills
- file-system
- fds-expert
- quality-expert
- fds-planner
