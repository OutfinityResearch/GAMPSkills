
import { stripDependsOn } from '../../../utils/ArgumentResolver.mjs';

function buildPlannerPrompt(userPrompt) {
  return `You are an FDS planning assistant.

Your task is to plan the File Design Specifications (FDS) set.
List all intended FDS file paths under "./docs/specs/src" and the dependencies between them.

Output rules:
- Return a plain text list, one file per line.
- Format each line as: <path> | depends: <comma-separated paths>.
- If a file has no dependencies, use: depends: none.
- Use only file paths, no extra commentary or headings.

User Prompt:
"""
${userPrompt}
"""`;
}

async function executeFdsPlanning({ prompt, llmAgent }) {
  const plannerPrompt = buildPlannerPrompt(prompt);

  const response = await llmAgent.executePrompt(plannerPrompt, {
    mode: 'deep',
  });

  if (typeof response !== 'string') {
    throw new Error('fds-planner: llmAgent.executePrompt must return a string.');
  }

  return response.trim();
}

export async function action(context) {
  const { llmAgent, promptText } = context;
  const sanitizedPrompt = stripDependsOn(promptText);

  if (!sanitizedPrompt) {
    return null;
  }

  return await executeFdsPlanning({ prompt: sanitizedPrompt, llmAgent });
}
