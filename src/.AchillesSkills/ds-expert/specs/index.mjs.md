# DS Expert Skill - Implementation Specification

## Purpose
The ds-expert skill generates Design Specification (DS) content focused on global vision, strategic goals, and high-level feature descriptions. DS files capture the "what" and "why" of systems without diving into technical implementation details.

## Capabilities

### Content Generation
- Generates strategic, vision-oriented specification content
- Focuses on global scope: entire systems, workflows, major components
- Produces non-technical content accessible to all stakeholders
- Returns concise DS-focused text without enforcing specific headings

### DS Characteristics
- **Global Scope**: Describes entire systems or major features, not individual files
- **Vision-Oriented**: Explains big picture, intended outcomes, success criteria
- **Non-Technical**: Avoids code, APIs, implementation details
- **Strategic**: Defines constraints, key decisions, governance

### Typical DS Topics
- Project vision and goals
- Backlog management approach
- Specification structure and workflow
- Review processes and governance
- Skill conventions and organization
- Component architecture (high-level)

## Input Contract
- The action resolves the prompt from `prompt`, `input`, or the first argument value.
- Requires `llmAgent` with `executePrompt`.

## Output Contract
- Returns a trimmed string response from the LLM
- Throws Error if prompt or llmAgent missing
- Returns `undefined` if no prompt could be resolved from inputs

## Implementation Details

### Technical Prompt Construction
The skill constructs a concise DS prompt that:
1. Sets DS scope and tone (global, non-technical, “what/why”)
2. Lists high-level guidance for short, clear responses
3. Embeds the user's original prompt

### LLM Interaction
- Uses `llmAgent.executePrompt()` with `mode: 'deep'`
- Deep mode ensures full reasoning for strategic content
- Returns trimmed response text

### LLM Call (Hardcoded Signature)
Call signature (must match exactly):
`llmAgent.executePrompt(technicalPrompt, { mode: 'deep' })`

- `technicalPrompt` is the DS prompt built by `buildTechnicalPrompt(userPrompt)`
- Expected return: string; otherwise throw `ds-expert: llmAgent.executePrompt must return a string.`

### Content Guidelines Enforced
- Focus on WHAT and WHY, not HOW
- Global perspective, not file-specific
- Strategic and accessible language
- Clear section structure
- No code or technical implementation

## Dependencies
- None (pure delegation to llmAgent)

## Code Generation Guidelines
When regenerating this skill:
1. Validate prompt and llmAgent presence
2. Construct comprehensive technical prompt explaining DS format
3. Include DS characteristics, scope, and examples in prompt
4. Embed user prompt within technical context
5. Use mode: 'deep' for LLM execution
6. Return trimmed response
7. Keep implementation minimal - focus on prompt engineering
