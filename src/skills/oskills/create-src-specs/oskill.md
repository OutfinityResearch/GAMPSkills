# create-src-specs

## Intents
Generate file-level technical specifications (FDS) from existing DS files and the user prompt, creating one FDS per intended source file under `./docs/specs/src`.

## Preparation
1. Using context-loader load all DS files that are only at the level `./docs/specs`. They have .md extension. Include `./AGENTS.md`.

## Allowed Preparation Skills
- context-loader

## Instructions
 You will receive as context all the global DS files.

1. For each unique FDS found in the DS files, call fds-expert to generate its content. Include as context the DS files that reference that file and expand the description that FDS already has.
    - The input given to the fds-expert skill must be descriptive enough to produce a complete, well-scoped FDS: describe the file’s purpose as a short narrative of what it must accomplish, its boundaries, and how it fits with dependencies. Use plain text only, no code examples.
    - When referencing other variables in this step always give a short explanation of the variables content. Example: Here are the DS files that you need to use as guidelines $dsFiles 
2. Call quality-expert to review the result from step 1, use profile fds and provide as context the same one from step 1.
3. Write the result from step 2 to `./docs/specs/src` using file-system.
4. As a final step, using project-manifest-expert update `./AGENTS.md` once with the paths of the files created, add any extra general relevant information for the project

- Create the source code folder structure as if you were implementing the project, but write FDS documents instead of code.
- Note: FDS stands for File Design Specification
- Note: FDS files should have the following naming convention: "name.mjs.md" where name is the intended file name to be used when the js code is finished

## Allowed Skills
- file-system
- fds-expert
- quality-expert
- fds-planner
- project-manifest-expert
