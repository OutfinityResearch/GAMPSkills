
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { stripDependsOn } from '../../../../utils/ArgumentResolver.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const FDS_STRUCTURE_PROFILE = await readFile(
  join(__dirname, 'FDS_structure.md'),
  'utf8'
);

function getFdsExpertPromptTemplate(userPrompt = '') {
  return `You are a File Design Specification (FDS) expert.

Focus on a single code file. Provide implementation-focused, regeneration-ready details.
Do not include code or low-level implementation steps beyond FDS descriptions.

FDS file structure guidance:
${FDS_STRUCTURE_PROFILE}

Guidelines:
- Be technical and file-specific.
- No extra commentary outside the FDS.

User Prompt:
"""
${userPrompt}
"""`;
}

function buildTechnicalPrompt(userPrompt) {
  return getFdsExpertPromptTemplate(userPrompt);
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
