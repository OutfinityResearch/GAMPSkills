# DS Expert Skill - Implementation Specification

## Purpose
The ds-expert skill generates Design Specification (DS) content focused on global vision, strategic goals, and high-level feature descriptions. DS files capture the "what" and "why" of systems without diving into technical implementation details.

## Capabilities

### Content Generation
- Generates strategic, vision-oriented specification content
- Focuses on global scope: entire systems, workflows, major components
- Produces non-technical content accessible to all stakeholders
- Structures content with clear sections: Overview, Purpose, Role, Vision, Principles, Outcomes

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
```javascript
{
  prompt: string,      // Required: user instructions for DS generation
  llmAgent: object     // Required: LLM agent with executePrompt method
}
```

## Output Contract
- Returns Markdown-formatted DS content as string
- Content follows DS structure with appropriate sections
- Throws Error if prompt or llmAgent missing

## Implementation Details

### Technical Prompt Construction
The skill constructs a detailed technical prompt that:
1. Defines DS format and structure requirements
2. Lists DS characteristics and scope
3. Provides examples of appropriate DS topics
4. Includes user's original prompt
5. Requests Markdown output with clear headings

### LLM Interaction
- Uses `llmAgent.executePrompt()` with `mode: 'deep'`
- Deep mode ensures full reasoning for strategic content
- Returns trimmed response text

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
