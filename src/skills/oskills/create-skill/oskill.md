# create-skill

## Intents
Create a new skill by producing DS and FDS specifications and then generating code .


## Instructions

1. Call docs-loader with the parameter "skills" to load the skills documentation from the docs bundle. Use it as guidance for creating the skill.
2. Derive a skill name from the user prompt based on its functionality. `${skillName}` always refers to the chosen skill name. Create the folder `${skillName}` , `${skillName}/specs` where its FDS specifications will reside.
3. Generate DS content for the new skill using ds-expert. The DS must describe the skill's purpose, inputs, outputs, constraints, and how it will be used.
4. Write the DS to `${skillName}/` using file-system.
5. Generate FDS files for the new skill using fds-expert. The FDS must describe each file that will be created for the skill. Use the DS as context.
6. Write all FDS files to `${skillName}/specs` using file-system.
7. Call mirror-code-generator to generate code from the DS/FDS for the new skill. provide as parameter the `${skillName}` directory.

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
- docs-loader

## Session Type
loop
