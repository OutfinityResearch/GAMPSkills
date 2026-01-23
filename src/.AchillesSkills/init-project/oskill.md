# init-project

## Description
This skill initializes a fresh project by creating `./docs`, `./docs/specs`, `./docs/specs/src`, and `./docs/specs/tests`, along with the root backlogs `./specs_backlog.md` and `./docs_backlog.md`. It also copies the static (non-LLM) spec-to-HTML converter (`specsLoader.html`) from the skill directory into `./docs` for viewing specs as HTML. It consumes a user prompt describing the intended project and seeds `./specs_backlog.md` with questions and proposals that reflect the prompt's complexity, including suggestions for which specification files to create next.

## Instructions
Execute the following sequence using the allowed skills:
1. Create directories: `./docs`, `./docs/specs`, `./docs/specs/src`, `./docs/specs/tests`
2. Create files `./specs_backlog.md` and `./docs_backlog.md` (backlogs can start empty or with basic structure)
3. Copy `./specsLoader.html` to `./docs/specsLoader.html`
4. Generate content for `./specs_backlog.md` with project-specific questions and proposals based on the user prompt, regarding DS files that need to be created

When calling skills, use natural language instructions:

**file-system examples:**
- "createDirectory ./docs"
- "writeFile ./specs_backlog.md content here"
- "copyFile ./specsLoader.html ./docs/specsLoader.html"

**backlog-io examples:**
- "loadBacklog specs"
- "appendTask specs newfile initial content"

**ds-expert examples:**
- "Generate DS content for project management system"

## Allowed Skills
- file-system
- backlog-io  
- ds-expert
