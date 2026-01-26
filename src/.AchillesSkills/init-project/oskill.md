# init-project

## Description
This skill initializes a fresh project by creating `./docs`, `./docs/specs`, `./docs/specs/src`, and `./docs/specs/tests`, along with the root backlogs `./specs_backlog.md` and `./docs_backlog.md`. It also copies the static (non-LLM) spec-to-HTML converter (`specsLoader.html`) from the skill directory into `./docs` for viewing specs as HTML. It consumes a user prompt describing the intended project and seeds `./specs_backlog.md` with questions and proposals that reflect the prompt's complexity, including suggestions for which specification files to create next.

## Instructions
By executing the allowed skills you must achieve the following results: 
- Create directories: `./docs`, `./docs/specs`, `./docs/specs/src`, `./docs/specs/tests`
- Create files `./specs_backlog.md` and `./docs_backlog.md`
- Generate content for `./specs_backlog.md` with project-specific questions and proposals based on the user prompt, regarding DS files that need to be created

**IMPORTANT:** 
- Do not generate content for specs_backlog, use ds-expert skill to generate that content, then use its result and backlog-io skill to create tasks in the backlog. You need to call ds-expert only once.
- Imagine you are a client who's asking a project manager about his new project, the prompt should be something like: Here is my idea of a project: (paste the user's initial prompt here), what's missing from it? do you have any proposals to improve it? What fundamental aspects have I omitted? 
- Each skill call handles only ONE operation. To perform multiple actions, call the same skill multiple times with different parameters.

## Allowed Skills
- file-system
- backlog-io  
- ds-expert
