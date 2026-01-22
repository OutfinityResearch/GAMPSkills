# init-project

## Description
This skill initializes a fresh project by creating `./docs`, `./docs/specs`, `./docs/specs/src`, and `./docs/specs/tests`, along with the root backlogs `./specs_backlog.md` and `./docs_backlog.md`. It also copies the static (non-LLM) spec-to-HTML converter (`specsLoader.html`) from the skill directory into `./docs` for viewing specs as HTML. It consumes a user prompt describing the intended project and seeds `./specs_backlog.md` with questions and proposals that reflect the prompt's complexity, including suggestions for which specification files to create next.

## Instructions
Execute the following sequence using the allowed skills:
1. Create directories: `./docs`, `./docs/specs`, `./docs/specs/src`, `./docs/specs/tests`
2. Create files `./specs_backlog.md` and `./docs_backlog.md` (backlogs can start empty or with basic structure)
3. Copy `./specsLoader.html` to `./docs/specsLoader.html`
4. Generate content for `./specs_backlog.md` with project-specific questions and proposals based on the user prompt, regarding DS files that need to be created

When calling skills, use their specific input formats:

**file-system:**
- operation: "readFile" | "writeFile" | "appendFile" | "deleteFile" | "createDirectory" | "listDirectory" | "fileExists" | "copyFile" | "moveFile"
- path: target file or directory path (required)
- content: file content (optional, for writeFile/appendFile)
- destination: destination path (optional, for copyFile/moveFile)

**backlog-io:**
- operation: "loadBacklog" | "getTask" | "recordIssue" | "proposeFix" | "approveResolution" | "findTasksByPrefix" | "findTaskByFileName" | "findTasksByStatus" | "setStatus" | "updateTask" | "appendTask"
- type: "specs" | "docs" (required)
- fileKey: file key for task operations (optional)
- issue: issue object for recordIssue (optional)
- proposal: proposal object for proposeFix (optional)
- resolution: resolution string for approveResolution (optional)
- prefix: prefix for findTasksByPrefix (optional)
- fileName: file name for findTaskByFileName (optional)
- status: status for findTasksByStatus or setStatus (optional)
- updates: updates object for updateTask (optional)
- initialContent: initial content for appendTask (optional)

**ds-expert:**
- prompt: user instructions for DS content generation (required)

## Allowed Skills
- file-system
- backlog-io  
- ds-expert
