# create-skill

## Intents
Create a new skill by producing DS and FDS specifications and then generating code .


## Instructions
Documentation: Skills are the unit of capability used by intelligent LLM-based agents, similar in spirit to CLI agents like Codex or Claude that use tools to act. In this system, the agents use skills instead of simple tools. Skills are more complex and dynamic than tools: they can chain multiple internal steps, invoke other skills, call the LLM, or load internal context before producing a result. Each skill is a self-contained folder under a shared `skills/` directory, and it becomes discoverable and executable through its Markdown descriptor. The descriptor defines the skill's family, intent surface, and contract. The runtime scans the `skills/` tree, registers each descriptor, and routes execution to the correct subsystem based on the descriptor filename. This makes skills auditable and composable: the system can plan with them explicitly, keep history of which skill did what, and run them deterministically even when the surrounding prompts are probabilistic. A typical layout looks like this:

skills/<domain>/<skill_name>/
  ├── <descriptor>.md
  └── optional code modules or generated artifacts depending on the family

The descriptor filename defines the skill family and the execution model. Claude (static) skills use `skill.md` and are metadata-only: they surface descriptive content but do not execute logic. DBTable skills use `tskill.md` and describe CRUD workflows over structured records. Orchestration skills use `oskill.md` and act as planners that coordinate other skills through loop or SOP sessions. MCP skills use `mskill.md` and provide a curated toolbelt for external Model Context Protocol servers. Dynamic code generation skills use `dcgskill.md` and decide at runtime whether to answer directly or synthesize code under strict rules. Code skills use `cskill.md` and are specification-driven: they rely on specs to generate stable modules and then execute those modules with a consistent interface.

Claude skills (`skill.md`) are the simplest family. They provide a title, summary, and body content and are used as reference knowledge, documentation, or lightweight capability descriptions. They do not call the LLM at runtime and do not execute any code. Their value is in discoverability and routing: they populate the catalog with authoritative descriptions and can be returned directly when users ask for definitions or documentation.

DBTable skills (`tskill.md`) define table-like entities and the rules that govern them. The descriptor describes the table purpose and then enumerates fields with nested sections for resolvers, validators, presenters, enumerators, derivators, and relationships. At runtime, the subsystem classifies the user intent (create, update, select, delete), fills missing values through conversational prompts, applies validation rules, derives computed fields, and persists through a database adapter. This family is designed for repeatable CRUD over structured data while still accepting natural-language input. The descriptor is the single source of truth for data rules and safety constraints.

Orchestration skills (`oskill.md`) are coordination playbooks. They do not implement business logic directly; instead they map a high-level objective into a structured sequence of calls to other skills. The descriptor contains Instructions (the planner's system prompt), Allowed Skills (the toolbelt), Intents (a compact action vocabulary), optional Preparation (a pre-context pass), and Session Type (loop or SOP). In loop mode, the planner chooses one tool at a time, observes results, and iterates. In SOP mode, the planner generates a full plan (SOPLang) first, then executes it with explicit dependencies. This makes orchestrators ideal for multi-step workflows and provides auditability through recorded plans and tool calls.

MCP skills (`mskill.md`) wrap external tools exposed through the Model Context Protocol. They list allowed tools and can optionally include a LightSOPLang script to define deterministic flows. The subsystem filters the available MCP tools against the allowlist, then either follows the script or asks the LLM to select tools. This family is appropriate for integrating external systems while keeping the allowed surface area explicit and reviewable.

Dynamic code generation skills (`dcgskill.md`) are optimized for short, bounded computations or transformations. The descriptor provides the prompt guidance, input argument description, and preferred LLM mode. At execution time, the subsystem may choose between returning text directly or generating a code snippet to run in a guarded wrapper. If a companion module exists, it can fully control how code is executed and how output is shaped. The output is normalized to a string so downstream consumers can treat the result consistently regardless of whether it came from text or code.

Code skills (`cskill.md`) are specification-driven and intended for more complex logic that benefits from explicit, auditable specs. The descriptor defines the public contract: Summary, Input Format, Output Format, and Constraints. The behavior itself is expressed in `specs/` files, each describing a module in natural language. A code generator turns those specs into actual code modules, and the subsystem executes the generated entrypoint on each request. This keeps behavior deterministic and maintainable: changes happen in specs, and the generated code is treated as an artifact.

Across all families, the skill folder is the unit of discovery, and the descriptor is the contract. The runtime uses that contract to route requests, apply safety constraints, and produce predictable outputs. As a result, skills are both human-readable and machine-executable, which makes them suitable for audited automation and repeatable workflows.

Creation flow:
1. Create the folder where the skill will be created.
2. Generate DS content for the new skill using ds-expert. The DS must describe the skill's purpose, inputs, outputs, constraints, and how it will be used.
3. Write the DS to disk in the skills folder using file-system.
4. Generate FDS files for the new skill using fds-expert. The FDS must describe each file that will be created for the skill. Use the DS as context.
5. Write all FDS files to `/specs` using file-system.
6. Call mirror-code-generator to generate code from the DS/FDS for the new skill.

- If the planner has ambiguities or errors, call ask-user to collect the missing details, then continue the flow.

- Always ensure the DS is created before FDS.
- Always ensure the FDS are written before calling mirror-code-generator.
- If multiple FDS files are needed, create and write each one.
- Do not generate code before the FDS files are written to disk.

## Allowed Skills
- ds-expert
- fds-expert
- file-system
- mirror-code-generator
- ask-user

## Session Type
loop
