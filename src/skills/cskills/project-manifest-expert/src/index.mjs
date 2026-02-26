import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { stripDependsOn } from '../../../../utils/ArgumentResolver.mjs';

const MANIFEST_FILENAME = 'AGENTS.md';

function buildManifestPrompt(userPrompt, existingContent) {
  return `You are a project manifest expert.

Your task is to produce the full content of the ${MANIFEST_FILENAME} file based on the provided instructions.
Return only the complete file content, with no extra commentary.

Existing ${MANIFEST_FILENAME} content:
"""
${existingContent || '(missing)'}
"""

User Instructions:
"""
${userPrompt}
"""`;
}

async function readExistingManifest(manifestPath) {
  try {
    return await readFile(manifestPath, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return '';
    }
    throw error;
  }
}

async function executeManifestGeneration({ prompt, llmAgent, manifestPath }) {
  const existingContent = await readExistingManifest(manifestPath);
  const technicalPrompt = buildManifestPrompt(prompt, existingContent);

  const response = await llmAgent.executePrompt(technicalPrompt, {
    mode: 'deep',
  });

  if (typeof response !== 'string') {
    throw new Error('project-manifest-expert: llmAgent.executePrompt must return a string.');
  }

  const nextContent = response.trim();
  await writeFile(manifestPath, nextContent, 'utf8');

  return nextContent;
}

export async function action(context) {
  const { llmAgent, promptText, ...args } = context;
  const rawPrompt = promptText ?? args.prompt ?? args.input ?? Object.values(args)[0];
  const sanitizedPrompt = stripDependsOn(rawPrompt ?? '');

  if (!sanitizedPrompt) {
    return null;
  }

  const manifestPath = resolve(process.cwd(), MANIFEST_FILENAME);

  return await executeManifestGeneration({
    prompt: sanitizedPrompt,
    llmAgent,
    manifestPath,
  });
}