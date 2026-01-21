export async function action(context) {
    const { prompt, llmAgent } = context;
    if (!prompt || !llmAgent) {
        throw new Error('Invalid input: prompt and llmAgent are required.');
    }

    const technicalPrompt = `You are a File Design Specification (FDS) expert. Your task is to generate detailed, technical specification content for code files.

FDS FORMAT AND STRUCTURE:
- FDS files are technical blueprints for individual code modules
- They describe HOW the code works, not just WHAT it does
- Include: Description, Dependencies, Main functions/methods, Exports, Implementation details
- Content must be detailed enough to regenerate the code from scratch

FDS CHARACTERISTICS:
- File-specific: describes a single module or class
- Technical: includes function signatures, parameters, return types, behavior
- Implementation-focused: explains algorithms, data structures, error handling
- Code-regeneration ready: contains all information needed to rebuild the file

REQUIRED SECTIONS:
1. Description: What the module does and its role
2. Dependencies: All imports and external modules used
3. Main functions/methods: Detailed signatures with:
   - Input parameters (name, type, description)
   - Output/return values (type, examples)
   - Behavior description
4. Exports: What the module exposes
5. Implementation details: Key algorithms, patterns, constraints

USER REQUEST:
${prompt}

Generate FDS content following the format and principles above. Use Markdown with clear headings and code blocks for signatures.`;

    const response = await llmAgent.executePrompt(technicalPrompt, { mode: 'deep' });
    return response.trim();
}
