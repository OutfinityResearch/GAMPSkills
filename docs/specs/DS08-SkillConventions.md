# DS08 – Skill Conventions

## Purpose
This document establishes the technical standards and conventions for all GAMPSkills modules. By centralizing these contracts, we ensure consistency across the system and simplify the creation of new skills. All skills described in `DS06-SkillsInventory` must adhere to these patterns unless explicitly stated otherwise.

## Module Interface
Every deterministic skill (JavaScript module) must export a single asynchronous entry point.

### Signature
```javascript
export async function action(context)
```

### Context Object
The `context` object passed to the action is the single source of truth for execution parameters. It typically contains:

- **`prompt`** (`string`): The user's input or instructions. Even for skills driven by backlogs, this may contain overrides or specific focus.
- **`llmAgent`** (`object`): The agent instance provided by the orchestrator. It must expose the method `executePrompt(prompt, options)`.

### Return Value
Skills return a string summary of their execution, describing what was accomplished (e.g., files created, issues found, or results). This provides a human-readable overview of the actions performed.

## LLM Interaction Standards

### Execution Mode
All LLM interactions must be performed with `mode: 'deep'`. This ensures the model uses its full reasoning capabilities for architectural decisions, content generation, and code reviews.
```javascript
await context.llmAgent.executePrompt(prompt, { mode: 'deep', ... });
```

### Multi-File Generation Format
When a skill requires the LLM to generate or modify files (especially multiple files in one pass), the standard output format is **Markdown** with specific delimiters.

**Delimiter Format:**
```markdown
<!-- FILE: relative/path/to/file.ext -->
[File Content Here]
```

**Parsing Rules:**
1.  **Regex**: Parsers should use a regex similar to `/^<!--\s*FILE:\s*(.+?)\s*-->$/m` to identify start blocks.
2.  **Relative Paths**: The path specified in the marker is strictly relative to the target directory defined by the skill's logic (e.g., `./docs/specs/src/` for `create-src-specs`).
3.  **Overwrite**: Unless specified otherwise, writing a file parsed from this format overwrites existing content.

## File System Operations
- **Root Anchor**: All paths must be resolved relative to the current working directory (`process.cwd()`).
- **Safety**: Skills should sanitize paths extracted from LLM responses to prevent directory traversal attacks (e.g., stripping `../`).
- **Directory Creation**: Skills are responsible for recursively creating directory trees (`mkdir -p`) before writing files.

## Backlog Interaction
Skills that interact with `specs_backlog.md` or `docs_backlog.md` follow these conventions:
- **Reading**: Parse specific sections (Global Specs, Local Specs, etc.) to maintain context focus.
- **Approved Items**: An item is considered "Approved" for execution (by `fix-specs`, etc.) only if the `Resolution` field contains non-whitespace text.
- **Status Updates**:
  - `needs_work`: Set by Review skills when issues are found.
  - `ok`: Set by Fix/Create skills after successfully applying changes or generating content.
