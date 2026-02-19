# create-src-specs

## Intents
Generate file-level technical specifications (FDS) from existing DS files and the user prompt, creating one FDS per intended source file under `./docs/specs/src`.

## Preparation
1. Using context-loader load all global DS files that are only at the level `./docs/specs`, basically depth 0.

## Allowed Preparation Skills
- context-loader

## Instructions
 You will receive as context all the global DS files.

1. For each FDS entry in the manifest, call fds-expert to generate its content. Include as context the DS files that reference that file and additional instructions for generating that file.
    - The input given to the fds-expert skill must be descriptive enough to produce a complete, well-scoped FDS: describe the file’s purpose as a short narrative of what it must accomplish, its boundaries, and how it fits with dependencies. Use plain text only, no code examples.
    - When referencing other variables in this step always give a short explanation of the variables content. Example: Here are the DS files that you need to use as guidelines $dsFiles 
2. Call quality-expert to review the result from step 1, use profile fds and provide as context the same DS context used at step 1 plus the manifest and any other relevant FDS content generated so far.
3. Write the result from step 2 to `./docs/specs/src` using file-system.

- Create the source code folder structure as if you were implementing the project, but write FDS documents instead of code.
- Note: FDS stands for File Design Specification
- Note: FDS files should have the following naming convention: "name.mjs.md" where name is the intended file name to be used when the js code is finished

## Allowed Skills
- file-system
- fds-expert
- quality-expert
- fds-planner
