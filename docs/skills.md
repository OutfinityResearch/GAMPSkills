# Skills Documentation

## Overview
Skills are the unit of capability used by intelligent LLM-based agents, similar in spirit to CLI agents like Codex or Claude that use tools to act. In this system, the agents use skills instead of simple tools. Skills are more complex and dynamic than tools: they can chain multiple internal steps, invoke other skills, call the LLM, or load internal context before producing a result. Each skill is a self-contained folder under a shared `skills/` directory, and it becomes discoverable and executable through its Markdown descriptor. The descriptor defines the skill's family, intent surface, and contract. The runtime scans the `skills/` tree, registers each descriptor, and routes execution to the correct subsystem based on the descriptor filename. This makes skills auditable and composable: the system can plan with them explicitly, keep history of which skill did what, and run them deterministically even when the surrounding prompts are probabilistic.

## Skill Folder Layout
Typical layout:

```
<skill_name>/
  ├── <descriptor>.md
  └── optional code modules or generated artifacts depending on the family
```

## Skill Naming
Skill names must use the format `skill-name`, all lowercase, and contain only alphabetical characters separated by single hyphens.

## Descriptor Families
The descriptor filename defines the skill family and the execution model.

### DBTable skills (`tskill.md`)
Define table-like entities and the rules that govern them. The descriptor describes the table purpose and enumerates fields with nested sections for resolvers, validators, presenters, enumerators, derivators, and relationships. At runtime, the subsystem classifies the user intent (create, update, select, delete), fills missing values through conversational prompts, applies validation rules, derives computed fields, and persists through a database adapter.

Example structure:
```
skills/data/inventory-item/
  ├── tskill.md
  └── specs/
      └── tskill.generated.mjs.md
```

### Orchestration skills (`oskill.md`)
Coordination playbooks. They do not implement business logic directly; instead they map a high-level objective into a structured sequence of calls to other skills. The descriptor contains Instructions (the planner's system prompt), Allowed Skills (the toolbelt), Intents (a compact action vocabulary), optional Preparation (a pre-context pass), and Session Type (loop or SOP). In loop mode, the planner chooses one tool at a time, observes results, and iterates. In SOP mode, the planner generates a full plan (SOPLang) first, then executes it with explicit dependencies.

Example structure:
```
skills/oskills/create-skill/
  └── oskill.md
```

### MCP skills (`mskill.md`)
Wrap external tools exposed through the Model Context Protocol. They list allowed tools and can optionally include a LightSOPLang script to define deterministic flows. The subsystem filters the available MCP tools against the allowlist, then either follows the script or asks the LLM to select tools.

Example structure:
```
skills/integrations/github-mcp/
  └── mskill.md
```

### Dynamic code generation skills (`dcgskill.md`)
Optimized for short, bounded computations or transformations. The descriptor provides the prompt guidance, input argument description, and preferred LLM mode. At execution time, the subsystem may choose between returning text directly or generating a code snippet to run in a guarded wrapper. If a companion module exists, it can fully control how code is executed and how output is shaped.

Example structure:
```
skills/utils/json-normalizer/
  ├── dcgskill.md
  └── src/
      └── index.mjs
```

### Code skills (`cskill.md`)
Specification-driven skills intended for more complex logic that benefits from explicit, auditable specs. The descriptor defines the public contract: Summary, Input Format, Output Format, and Constraints. The behavior itself is expressed in `specs/` files, each describing a module in natural language. A code generator turns those specs into actual code modules, and the subsystem executes the generated entrypoint on each request. Changes happen in specs, and the generated code is treated as an artifact.

For cskills, an FDS file named `index.mjs.md` is mandatory to define the entrypoint. This FDS must describe the exported `action` function and its behavior.

Example structure:
```
skills/io/file-reader/
  ├── cskill.md
  ├── specs/
  │   └── index.mjs.md
  └── src/
      └── index.mjs
```

## DS and FDS (Design Specs)
In addition to the descriptor, skills can include a DS file in the skill folder that describes, at a high level, what the skill does (purpose, inputs, outputs, constraints, usage). The technical implementation is captured in FDS (file design spec) documents stored under `specs/`, one file per module or artifact that will be created.

An FDS represents a concrete code file with a 1:1 mapping. For example, `src/helper.mjs` corresponds to `specs/helper.mjs.md`. Create FDS files with this mapping in mind, and in the DS include an `Affected files` section that lists the paths to the FDS files that will be created. The DS is the high-level contract; the FDS files are the technical blueprint used for code generation.

## Code Skill Entrypoint
For any skill that includes executable code, the implementation must include `src/index.js` or `src/index.mjs` exporting an `action` function with this signature:

```js
export async function action(context) {
  const { llmAgent, promptText } = context;
}
```

`promptText` is the string input arguments for the skill. `llmAgent` is the agent instance used to call the LLM, start other agent sessions, or access the `inputReader` and `outputWriter` interfaces. Use `inputReader` to ask the user questions during execution.
