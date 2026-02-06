
function buildTechnicalPrompt(userPrompt) {
  return `You are a File Design Specification (FDS) expert.

Focus on a single code file/module. Provide implementation-focused, regeneration-ready details.
Do not include code or low-level implementation steps beyond FDS descriptions.

Required Markdown sections (in this exact order):
1. Description
2. Dependencies
3. Main Functions/Methods
4. Exports
5. Implementation Details

Guidelines:
- Be technical and file-specific.
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

function stripDependsOn(input) {
  if (!input) return '';
  const match = input.match(/\bdependsOn\s*:\s*/i);
  if (!match || match.index === undefined) {
    return input;
  }
  return input.slice(0, match.index).trimEnd();
}
