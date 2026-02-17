
import { stripDependsOn } from '../../utils/ArgumentResolver.mjs';

function buildTechnicalPrompt(userPrompt) {
  return `You are a File Design Specification (FDS) expert.

Focus on a single code file. Provide implementation-focused, regeneration-ready details.
Do not include code or low-level implementation steps beyond FDS descriptions.

Required Markdown sections (in this exact order):
1. Description
2. Dependencies
3. Main Functions/Methods
4. Exports
5. Implementation Details

Guidelines:
- Be technical and file-specific.
- Description: Provide a thorough description of the file being generated. Explain its responsibilities, its role in the system, and what type of artifact it is (class, utility module, interface, etc.).
- Dependencies: List all dependencies used by this file. Include internal vs external, any libraries, and imported files with the paths they would be imported from, plus why each dependency is needed.
- Main Functions/Methods: List exact function or method names. For each, specify input parameters and types (string, object, array, etc.). If a parameter is a custom shape, describe its properties (e.g., { age, dateOfBirth, address }). Specify output type/shape, errors, and edge cases. Describe what the function does in detail and how it should be implemented.
- Exports: Describe what elements are exported for external use.
- Implementation Details: Provide general implementation rules or constraints that must be respected for this file.
- Include signatures in code blocks for key functions/methods.
- Note inputs, outputs, errors, and edge cases.
- If a section has no content, explicitly say so.
- No extra commentary outside the FDS.

User Prompt:
"""
${userPrompt}
"""`;
}

async function executeFdsGeneration({ prompt, llmAgent }) {

  const technicalPrompt = buildTechnicalPrompt(prompt);

  const response = await llmAgent.executePrompt(technicalPrompt, {
    mode: 'deep',
  });

  if (typeof response !== 'string') {
    throw new Error('fds-expert: llmAgent.executePrompt must return a string.');
  }

  return response.trim();
}

export async function action(context) {
  const { llmAgent, ...args } = context;
  const resolvedPrompt = stripDependsOn(args.prompt || args.input || Object.values(args)[0]);

  if (!resolvedPrompt) {
    return null;
  }

  return await executeFdsGeneration({ prompt: resolvedPrompt, llmAgent });
}
