# Init Project Technical Specification

## Overview
This module implements the `init-project` skill, responsible for bootstrapping a new project environment. It creates the necessary directory structure for specifications and documentation, installs static tools, and initializes the project backlogs. It leverages an LLM to analyze the user's project request and seed the specification backlog with initial high-level guidance, questions, and structural proposals.

## File Location
`src/.AchillesSkills/init-project/init-project.mjs`

## Interface
The module must export a single asynchronous function named `action`.

```javascript
export async function action(context)
```

The function accepts a `context` object containing the following properties:
- **`prompt`** (string, required): The user's description of the project to initialize.
- **`llmAgent`** (object, required): The LLM agent instance provided by the orchestrator, exposing an `executePrompt(prompt, options)` method.

The function returns a string summarizing the actions performed, such as "Project initialized: X directories created, Y files created. Backlog seeded with project name 'Z'."

## Logic Flow

### 1. Input Validation
The module verifies that `prompt` is a non-empty string, and `llmAgent` exists with the required method. Errors are thrown if any validation fails.

### 2. Directory Structure Initialization
The module creates the following directory hierarchy within the current working directory, ensuring they exist:
- `./docs`
- `./docs/specs`
- `./docs/specs/src`
- `./docs/specs/tests`

### 3. Static Asset Installation
The module locates the static spec-to-HTML converter file within its own skill directory. It copies this file to `./docs/` in the target project. The implementation assumes the source file exists relative to the skill's module location.

### 4. Backlog File Initialization
The module creates two empty backlog files at the project root if they do not exist:
- `./specs_backlog.md`
- `./docs_backlog.md`

### 5. LLM Analysis and Project Scoping
The module constructs a specialized prompt for the LLM to act as an expert project manager.
- **System Instruction**: "You are an expert project manager. Based on the user's prompt, generate questions, identify problems, and propose solutions for a new software project. At this time we are only dealing with the high-level specifications of the project, not technical details."
- **Task**:
  1. Deduce a project name from the user prompt or invent a suitable one.
  2. Generate initial content for `./specs_backlog.md`.
- **Output Constraint**: The LLM must output the analysis in a format suitable for direct insertion into the backlog, adhering to the structure defined in `FDS02-BacklogManager.md` (sections with Description, Status, Issues, Options, Resolution).
- **Execution Mode**: The LLM must be invoked with `mode: 'deep'`.

### 6. Backlog Seeding
The module parses the LLM's response to extract the project name and the backlog content. It then writes the generated content into `./specs_backlog.md`, effectively seeding the project's specification planning process.

## Dependencies
- `node:fs` - For file system operations (mkdir, copyFile, writeFile).
- `node:path` - For path resolution.

## Error Handling
- Throw errors if inputs are missing or invalid.
- Throw errors if file system operations fail (e.g., permissions, source file missing).
- Throw errors if the LLM response is empty or malformed (cannot extract project name or backlog content).
