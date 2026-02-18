import {stripDependsOn} from '../../utils/ArgumentResolver.mjs';
import {DS_STRUCTURE_PROFILE} from '../ds-expert/index.mjs';
import {FDS_STRUCTURE_PROFILE} from '../fds-expert/index.mjs';

function buildReviewPrompt({ fileContent, profile, context }) {
  const profilePrompt = getProfilePrompt(profile);
  return `Review and, if needed, fix the file content using the structure defined by the selected profile above.
Check the file for section structure, internal consistency, logic, syntax conventions, and any file paths or dependencies referenced.
Also apply any additional review requirements included in the context.

Below is the defined structure:
${profilePrompt}

You MUST return valid JSON only, with one of the following shapes:
- {"content":"<updated file content>"} if any change is required
- {"content":""} if no change is needed

File content:
${fileContent}

Context:
${context}`;
}

function getProfilePrompt(profile) {
  const normalized = String(profile || '').trim().toLowerCase();
  if (normalized === 'ds') {
    return DS_STRUCTURE_PROFILE;
  }
  if (normalized === 'fds') {
    return FDS_STRUCTURE_PROFILE;
  }
  if (normalized === 'docs' || normalized === 'code') {
    throw new Error(`quality-expert: Unsupported profile "${profile}" (TBD).`);
  }
  throw new Error(`quality-expert: Unknown profile "${profile}".`);
}

function parseInput(rawInput) {
  const text = String(rawInput || '').trim();
  if (!text) {
    throw new Error('quality-expert: Missing input string.');
  }
  const match = text.match(/fileContent\s*:\s*([\s\S]*?)\s*profile\s*:\s*([\s\S]*?)\s*context\s*:\s*([\s\S]*)$/i);
  if (!match) {
    throw new Error('quality-expert: Invalid input format. Expected: fileContent: ... profile: ... context: ...');
  }
  const fileContent = match[1].trim();
  const profile = match[2].trim();
  const context = match[3].trim();
  if (!fileContent) {
    throw new Error('quality-expert: Missing required parameter fileContent.');
  }
  if (!profile) {
    throw new Error('quality-expert: Missing required parameter profile.');
  }
  if (!context) {
    throw new Error('quality-expert: Missing required parameter context.');
  }
  return { fileContent, profile, context };
}

async function executeQualityReview({ prompt, llmAgent }) {
  const { fileContent, profile, context } = parseInput(prompt);
  const reviewPrompt = buildReviewPrompt({ fileContent, profile, context });

  const response = await llmAgent.executePrompt(reviewPrompt, {
    mode: 'deep',
  });

  if (typeof response !== 'string') {
    throw new Error('quality-expert: llmAgent.executePrompt must return a string.');
  }

  let parsed = null;
  try {
    parsed = JSON.parse(response);
  } catch (error) {
    throw new Error('quality-expert: LLM response is not valid JSON.');
  }

  const content = parsed && typeof parsed.content === 'string' ? parsed.content : null;
  if (content === null) {
    throw new Error('quality-expert: LLM JSON must include a string "content" field.');
  }
  if (!content.trim()) {
    return fileContent;
  }
  return content;
}

export async function action(context) {
  const { llmAgent, promptText } = context;
  const sanitizedPrompt = stripDependsOn(promptText);

  return await executeQualityReview({ prompt: sanitizedPrompt, llmAgent });
}
