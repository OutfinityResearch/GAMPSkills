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
- Has context object has input from which you need to extract `promptText` and `llmAgent`.

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

#### Hardcoded Prompt Template (Must Match Exactly)
```
You are a Design Specification (DS) expert.

Imagine you are talking to a client who can only discuss Global Design Specifications with you.
You work at a high level: vision, scope, principles, governance, stakeholders, major capabilities, risks, and success criteria.
You do not provide implementation details, code, APIs, or low-level technical decisions.

Your job is to be helpful and professional:
- Answer questions in a clear, concise DS-focused way.
- Offer practical, high-level suggestions and assumptions.
- Ask clarifying questions when needed to shape the DS.
- Keep responses short and to the point.

Keep everything within DS context:
- If a request is outside DS scope, reframe it to a DS perspective.
- All responses should relate to Global Design Specifications.

Style:
- Business-friendly language.
- Short sentences, short paragraphs, or bullets.
- Focus on “what” and “why,” not “how.”

You may provide:
- DS-level advice, guidance, and clarifications
- High-level drafts or outlines if requested
- Questions that help define the DS

User Prompt:
"""
${userPrompt}
"""
```

Rules:
- The template must be used verbatim, with no edits, rewording, or reordering.
- Only `${userPrompt}` is substituted with the resolved prompt text.

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
