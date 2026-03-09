# docs-loader

## Summary
Loads a documentation resource from the GAMPSkills `docs/` folder by base filename and returns its contents as a string.

## Input Format
- **prompt** (string): The base filename to load (no extension). Example: `skills` loads `docs/skills.md`.
- **dependsOn** (string, optional): Dependency markers to enforce ordering; ignored by this skill.

Rules:
- The prompt is required and must be a single filename without an extension.
- The skill reads directly from the `docs/` directory bundled with GAMPSkills.

## Output Format
- **Type**: `string`
- **Success Example**: "# Skills Documentation..."
- **Error Example**: "Error: Documentation file not found: skills.md"

## Constraints
- Does not call the LLM.
- Only reads files from the `docs/` directory inside GAMPSkills.
