# create-src-specs

## Intents
The create-src-specs skill generates technical specifications for source files by transforming DS inputs into FDS documents under the specs source directory.

## Instructions
Workflow:
1. Use file-system to list all DS files under `./docs/specs`.
2. Read every selected DS file and combine them into a shared context, ignore any file under `./docs/specs/src` or `./docs/specs/tests`.
3. Using this shared context call fds-expert to generate a plan of what files need to be made and a short description for each file what its role should be.
4. Using the shared context and a description and name of a fds file call fds-expert to generate the technical specification for that file.
5. Write the generated specification to `./docs/specs/src` using file-system.
6. For the next specification generation append the previously generated file content to the shared context, so fds-expert can see what was already produced and continue consistently.
7. Continue the generation file-by-file until all aspects in the DS files have been covered.

- Note: FDS files should have the following naming convention: "name.mjs.md" where name is the intended file name to be used when the js code is finished
- Note: FDS src files should only be written to `./docs/specs/src`

## Allowed Skills
- file-system
- fds-expert

## Loop
true
