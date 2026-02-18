# FDS Expert Skill - Implementation Specification

## Purpose
The fds-expert skill generates File Design Specification (FDS) content with detailed technical implementation information. FDS files serve as technical blueprints that enable complete code regeneration for individual modules.

## Capabilities

### Content Generation
- Generates technical specifications for a single code module/file
- Produces implementation-focused documentation
- Creates code-regeneration-ready specifications
- Requires fixed sections: Description, Dependencies, Main Functions/Methods, Exports, Implementation Details

### FDS Characteristics
- **File-Specific**: Describes individual modules, classes, or files
- **Technical**: Includes function signatures, parameters, types, behavior
- **Implementation-Focused**: Explains algorithms, data structures, error handling
- **Regeneration-Ready**: Contains all information needed to rebuild code

### Required Sections
1. **Description**: Module purpose and role in system
2. **Dependencies**: All imports and external modules with usage notes
3. **Main Functions/Methods**: Key signatures in code blocks, plus inputs/outputs/errors/edge cases
4. **Exports**: Public API surface
5. **Implementation Details**: Algorithms, patterns, constraints, edge cases

## Input Contract
- The action resolves the prompt from `prompt`, `input`, or the first argument value.
- Requires `llmAgent` with `executePrompt`.

## Output Contract
- Returns Markdown-formatted FDS content as string
- Content follows the required FDS section order
- Includes code blocks for signatures (examples are optional)
- Throws Error if prompt or llmAgent missing
- Returns `undefined` if no prompt could be resolved from inputs

## Implementation Details

### Technical Prompt Construction
The skill constructs a short, structured prompt that:
1. Defines the required section order via a separate structure profile
2. Emphasizes file-specific, implementation-focused content
3. Requires signatures in code blocks and notes on inputs/outputs/errors/edge cases
4. Embeds the user's original prompt

### FDS Structure Profile (Exported)
The structure guidance is isolated and exported for reuse by other skills:
```
Use these required sections in this exact order:
1. Description
2. Dependencies
3. Main Functions/Methods
4. Exports
5. Implementation Details

Section guidance:
- Description: Thoroughly describe the file's responsibilities, role, and artifact type (class, utility module, interface, etc.).
- Dependencies: List all dependencies, internal vs external, imports with paths, and why each is needed.
- Main Functions/Methods: List exact names, inputs with types and shapes, outputs, errors, edge cases, and how to implement.
- Exports: Describe what is exported for external use.
- Implementation Details: Provide general implementation rules or constraints.
Include signatures in code blocks for key functions/methods. If a section has no content, explicitly say so.
```

#### Hardcoded Prompt Template (Must Match Exactly)
```
You are a File Design Specification (FDS) expert.

Focus on a single code file/module. Provide implementation-focused, regeneration-ready details.
Do not include code or low-level implementation steps beyond FDS descriptions.

FDS file structure guidance:
{{FDS_STRUCTURE_PROFILE}}

Guidelines:
- Be technical and file-specific.
- No extra commentary outside the FDS.

User Prompt:
"""
${userPrompt}
"""
```

Rules:
- The template must be used verbatim, with no edits, rewording, or reordering.
- Only `${userPrompt}` and the FDS structure profile are substituted into the template.

### LLM Interaction
- Uses `llmAgent.executePrompt()` with `mode: 'deep'`
- Deep mode ensures thorough technical analysis
- Returns trimmed response text

### LLM Call (Hardcoded Signature)
Call signature (must match exactly):
`llmAgent.executePrompt(technicalPrompt, { mode: 'deep' })`

- `technicalPrompt` is the FDS prompt built by `buildTechnicalPrompt(userPrompt)`
- Expected return: string; otherwise throw `fds-expert: llmAgent.executePrompt must return a string.`

### Content Guidelines Enforced
- Focus on HOW, not just WHAT
- File-specific, not global
- Technical and implementation-detailed
- Include all regeneration information
- Use code blocks for signatures
- Document edge cases and constraints

## Dependencies
- None (pure delegation to llmAgent)

## Code Generation Guidelines
When regenerating this skill:
1. Validate prompt and llmAgent presence
2. Construct comprehensive technical prompt explaining FDS format
3. Include all required sections in prompt template
4. Emphasize code-regeneration capability
5. Embed user prompt within technical context
6. Use mode: 'deep' for LLM execution
7. Return trimmed response
8. Keep implementation minimal - focus on prompt engineering
