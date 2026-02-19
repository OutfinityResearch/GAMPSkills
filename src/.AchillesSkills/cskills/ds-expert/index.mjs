
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { stripDependsOn } from '../../../utils/ArgumentResolver.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DS_STRUCTURE_PROFILE = await readFile(
  join(__dirname, 'DS_structure.md'),
  'utf8'
);

function getDsExpertPromptTemplate(userPrompt = '') {
  return `You are a Design Specification (DS) expert.

Your task is to produce the content of a DS file based on the provided instructions. Follow the input precisely and do not add commentary outside the DS content.

Style requirements:
Write in professional, business-appropriate language using paragraphs only. Avoid bullet points and lists. Keep paragraphs concise. Focus on “why” and “what” for the current subject, not “how.”

DS file structure guidance:
${DS_STRUCTURE_PROFILE}

User Prompt:
"""
${userPrompt}
"""`;
}

function buildTechnicalPrompt(userPrompt) {
  return getDsExpertPromptTemplate(userPrompt);
}

async function executeDSGeneration({ prompt, llmAgent }) {

  const technicalPrompt = buildTechnicalPrompt(prompt);

  const response = await llmAgent.executePrompt(technicalPrompt, {
    mode: 'deep',
  });

  if (typeof response !== 'string') {
    throw new Error('ds-expert: llmAgent.executePrompt must return a string.');
  }

  return response.trim();
}

export async function action(context) {
  const { llmAgent, promptText } = context;
  const sanitizedPrompt = stripDependsOn(promptText);

  return await executeDSGeneration({ prompt: sanitizedPrompt, llmAgent });
}
