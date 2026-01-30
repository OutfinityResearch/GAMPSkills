# DS08 – Skill Conventions

## Purpose
This document establishes the technical standards and conventions for all GAMPSkills modules. By centralizing these contracts, we ensure consistency across the system and simplify the creation of new skills. All skills described in `DS06-SkillsInventory` must adhere to these patterns unless explicitly stated otherwise.

## Skill Organization
All skills must be located under a dedicated folder named `.AchillesSkills`. Each skill must reside in its own subfolder within `.AchillesSkills` to be properly registered and recognized by the system. This structure ensures proper isolation, organization, and automated discovery of skill modules.

Example structure:
```
.AchillesSkills/
  skill-name-1/
    oskill.md
    [other skill files]
  skill-name-2/
    oskill.md
    [other skill files]
```

## Skill Metadata Files
Each skill has a descriptor file in its `.AchillesSkills/<skill-name>/` folder. The descriptor type depends on the skill implementation:

- **Orchestrator skills** use `oskill.md`.
- **Deterministic code skills** use `cskill.md`.

- **# Skill Name**: Required, must be exactly the name of the skill folder
- **Instructions**: Detailed guidance on how the skill operates, including any special behaviors, input formats, or output expectations.

Example structure:
```
# Skill Name

## Summary
Brief description of what the skill does.

## Instructions
Detailed operational guidance, including examples if applicable.
```

Descriptor files serve as documentation for a skill's interface and behavior.

## Module Interface
Every deterministic skill (JavaScript module) must export a single asynchronous entry point.

### Signature
```javascript
export async function action(context)
```

### Context Object
The `context` object passed to the action is the single source of truth for execution parameters. It typically contains:

- **`promptText`** (`string`): The raw user input for deterministic code skills that parse their own command format.
- **`prompt`** (`string`): The user's input or instructions when explicitly provided by the orchestrator.
- **`llmAgent`** (`object`): The agent instance provided by the orchestrator. It may expose `executePrompt(prompt, options)` and/or `complete(...)` depending on usage.

### Return Value
Skills may return a human-readable string or a structured object, depending on the operation (for example, backlog queries return data structures, while file operations return status messages).

## LLM Interaction Standards

### Execution Mode
Content-generation skills should call `executePrompt` with `mode: 'deep'` to ensure high-quality outputs. Lightweight argument extraction may use the LLM's completion interface when needed.
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
  - `needs_work`: Set by Review skills when problems are found.
  - `ok`: Set by Fix/Create skills after successfully applying changes or generating content.
