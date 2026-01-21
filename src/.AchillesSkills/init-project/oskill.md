# init-project

## Description
This skill initializes a fresh project by creating `./docs`, `./docs/specs`, `./docs/specs/src`, and `./docs/specs/tests`, along with the root backlogs `./specs_backlog.md` and `./docs_backlog.md`. It also copies the static (non-LLM) spec-to-HTML converter (`specsLoader.html`) from the skill directory into `./docs` for viewing specs as HTML. It consumes a user prompt describing the intended project and seeds `./specs_backlog.md` with questions and proposals that reflect the prompt's complexity, including suggestions for which specification files to create next.

## Instructions
Execute the following sequence using the allowed skills:
1. Use create-directories to create: `./docs`, `./docs/specs`, `./docs/specs/src`, `./docs/specs/tests`
2. Use generate-text to create initial content for `./specs_backlog.md` and `./docs_backlog.md` (backlogs can start empty or with basic structure)
3. Use copy-file to copy `specsLoader.html` from the skill directory to `./docs/specsLoader.html`
4. Use generate-text to seed `./specs_backlog.md` with project-specific questions and proposals based on the user prompt, including suggestions for next specification files

## Allowed Skills
- create-directories
- copy-file
- generate-text
- review-text
- iterate-on-feedback