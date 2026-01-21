# FDS Expert Skill - Implementation Specification

## Purpose
The fds-expert skill generates File Design Specification (FDS) content with detailed technical implementation information. FDS files serve as technical blueprints that enable complete code regeneration for individual modules.

## Capabilities

### Content Generation
- Generates detailed technical specifications for code modules
- Produces implementation-focused documentation
- Creates code-regeneration-ready specifications
- Structures content with technical sections: Description, Dependencies, Functions, Exports, Implementation

### FDS Characteristics
- **File-Specific**: Describes individual modules, classes, or files
- **Technical**: Includes function signatures, parameters, types, behavior
- **Implementation-Focused**: Explains algorithms, data structures, error handling
- **Regeneration-Ready**: Contains all information needed to rebuild code

### Required Sections
1. **Description**: Module purpose and role in system
2. **Dependencies**: All imports and external modules with usage notes
3. **Main Functions/Methods**: Detailed specifications including:
   - Function signatures
   - Input parameters (name, type, description)
   - Output/return values (type, examples)
   - Behavior and logic description
4. **Exports**: Public API surface
5. **Implementation Details**: Algorithms, patterns, constraints, edge cases

## Input Contract
```javascript
{
  prompt: string,      // Required: user instructions for FDS generation
  llmAgent: object     // Required: LLM agent with executePrompt method
}
```

## Output Contract
- Returns Markdown-formatted FDS content as string
- Content follows FDS structure with all required sections
- Includes code blocks for signatures and examples
- Throws Error if prompt or llmAgent missing

## Implementation Details

### Technical Prompt Construction
The skill constructs a detailed technical prompt that:
1. Defines FDS format and required sections
2. Lists FDS characteristics and technical depth
3. Specifies signature format requirements
4. Emphasizes code-regeneration capability
5. Includes user's original prompt
6. Requests Markdown with code blocks

### LLM Interaction
- Uses `llmAgent.executePrompt()` with `mode: 'deep'`
- Deep mode ensures thorough technical analysis
- Returns trimmed response text

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
