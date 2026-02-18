# create-src-specs

## Intents
Generate file-level technical specifications (FDS) from existing DS files and the user prompt, creating one FDS per intended source file under `./docs/specs/src`.

## Preparation
1. Using context-loader load all global DS files that are only at the level `./docs/specs`, basically depth 0. Also include `./AGENTS.md`.
2. Update `./AGENTS.md` with the full list of intended FDS files under `./docs/specs/src`, their dependencies (import paths), and public exports per file.
3. Write the manifest to `./AGENTS.md` using file-system.
4. Use context-loader to load `./AGENTS.md` and return it as preparation context.

## Allowed Preparation Skills
- context-loader
- file-system

## Instructions
1. Use `./docs/specs/src/FDS_MANIFEST.md` as the single source of truth for which FDS files to create and what they depend on.
2. For each FDS file listed in the manifest, using the DS files context and the manifest call fds-expert to generate the technical specification for that file.
3. Call quality-expert for evaluation with the generated content, use profile fds and provide as context what was given at step 2.
4. Write the generated specification to `./docs/specs/src` using file-system.

- Create the source code folder structure as if you were implementing the project, but write FDS documents instead of code.
- Note: FDS stands for File Design Specification
- Note: FDS files should have the following naming convention: "name.mjs.md" where name is the intended file name to be used when the js code is finished

## Allowed Skills
- file-system
- fds-expert
- quality-expert
