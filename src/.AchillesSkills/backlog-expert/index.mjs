function buildBacklogExpertPrompt(userPrompt) {
  const template = `You are a backlog expert. Your output is written directly into backlog files.

Behaviors:
- If the user asks to generate backlog tasks, output ONLY numbered lines (e.g., "1. ...", "2. ...", "3. ...") with no extra prose or headings.
- If the user asks to generate options for a task, output ONLY numbered lines (e.g., "1. ...", "2. ...", "3. ...") with no extra prose or headings.
- If the user asks for a resolution or a single update text, respond with a concise plain-text sentence or short paragraph only.
- Do not add commentary, analysis, or headings.

User Prompt:
"""
${userPrompt}
"""`;
  return template;
}

async function executeBacklogExpert({ prompt, llmAgent }) {
  const expertPrompt = buildBacklogExpertPrompt(prompt);

  const response = await llmAgent.executePrompt(expertPrompt, {
    mode: 'deep',
  });

  if (typeof response !== 'string') {
    throw new Error('backlog-expert: llmAgent.executePrompt must return a string.');
  }

  return response.trim();
}

export async function action(context) {
  const { llmAgent, promptText } = context;
  const sanitizedPrompt = stripDependsOn(promptText);

  return await executeBacklogExpert({ prompt: sanitizedPrompt, llmAgent });
}

function stripDependsOn(input) {
  if (!input) return '';
  const match = input.match(/\bdependsOn\s*:\s*/i);
  if (!match || match.index === undefined) {
    return input;
  }
  return input.slice(0, match.index).trimEnd();
}