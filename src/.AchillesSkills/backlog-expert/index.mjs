import { stripDependsOn } from '../../utils/ArgumentResolver.mjs';

function buildBacklogExpertPrompt(userPrompt) {
  const template = `You are a backlog expert. Your job is to generate content that can be written in files of type backlog.
   A backlog is split into tasks, each task has a description, a list of options that represent the possible solutions to that task and a resolution field. 
   The resolution is the approved option that will be used to fulfill that task.
   Your output is written directly into backlog files.

Behaviors:
- If the user asks to generate backlog tasks, output ONLY numbered lines with tasks descriptions (e.g., "1. ...", "2. ...", "3. ...") with no extra prose or headings. In the task description you must mention the exact specs files which would be affected by this task.
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
