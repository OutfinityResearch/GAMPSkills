import {stripDependsOn} from '../../../../utils/ArgumentResolver.mjs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let DS_STRUCTURE_PROFILE;
let FDS_STRUCTURE_PROFILE;

// Using Promise.all to load profiles in parallel at startup.
await Promise.all([
  readFile(
    join(__dirname, '../ds-expert/src/DS_structure.md'),
    'utf8'
  ).then(content => DS_STRUCTURE_PROFILE = content),
  readFile(
    join(__dirname, '../fds-expert/src/FDS_structure.md'),
    'utf8'
  ).then(content => FDS_STRUCTURE_PROFILE = content)
]);


/**
 * Selects the structure profile string based on the profile name.
 * @param {string} profile - The name of the profile ('ds', 'fds').
 * @returns {string} The content of the selected profile.
 * @throws {Error} If the profile is unknown or unsupported.
 */
function getProfilePrompt(profile) {
  const normalized = String(profile || '').trim().toLowerCase();
  switch (normalized) {
    case 'ds':
      return DS_STRUCTURE_PROFILE;
    case 'fds':
      return FDS_STRUCTURE_PROFILE;
    case 'docs':
    case 'code':
      throw new Error(`quality-expert: Unsupported profile "${profile}" (TBD).`);
    default:
      throw new Error(`quality-expert: Unknown profile "${profile}".`);
  }
}

/**
 * Parses the raw input string to extract fileContent, profile, and context.
 * @param {string} rawInput - The raw input string.
 * @returns {{fileContent: string, profile: string, context: string}} The parsed components.
 * @throws {Error} If the input is invalid or missing required fields.
 */
function parseInput(rawInput) {
  const text = String(rawInput || '').trim();
  if (!text) {
    throw new Error('quality-expert: Missing input string.');
  }

  const regex = /fileContent\s*:\s*([\s\S]*?)\s*profile\s*:\s*([\s\S]*?)\s*context\s*:\s*([\s\S]*)$/;
  const match = text.match(regex);

  if (!match) {
    throw new Error('quality-expert: Invalid input format. Expected: fileContent: ... profile: ... context: ...');
  }

  const [, fileContent, profile, context] = match.map(m => m.trim());

  if (!fileContent) {
    throw new Error('quality-expert: Missing required parameter fileContent.');
  }
  if (!profile) {
    throw new Error('quality-expert: Missing required parameter profile.');
  }
  // Context can be empty, so no check for it.

  return { fileContent, profile, context };
}


/**
 * Builds the LLM prompt for quality review.
 * @param {object} params
 * @param {string} params.fileContent - The content of the file to review.
 * @param {string} params.profile - The profile to use for the review.
 * @param {string} params.context - Additional context for the review.
 * @returns {string} The complete prompt for the LLM.
 */
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

/**
 * Executes the quality review by interacting with the LLM.
 * @param {object} params
 * @param {string} params.prompt - The raw input prompt containing file content, profile, and context.
 * @param {object} params.llmAgent - The LLM agent for executing prompts.
 * @returns {Promise<string>} The updated file content or the original content if no changes were needed.
 * @throws {Error} If the LLM response is invalid.
 */
async function executeQualityReview({ prompt, llmAgent }) {
  const { fileContent, profile, context } = parseInput(prompt);
  const reviewPrompt = buildReviewPrompt({ fileContent, profile, context });

  const response = await llmAgent.executePrompt(reviewPrompt, { mode: 'deep' });

  if (typeof response !== 'string' || !response.trim()) {
    throw new Error('quality-expert: LLM response must be a non-empty string.');
  }

  let parsed;
  try {
    parsed = JSON.parse(response);
  } catch (error) {
    throw new Error(`quality-expert: LLM response is not valid JSON. Error: ${error.message}`);
  }

  if (typeof parsed.content !== 'string') {
    throw new Error('quality-expert: LLM JSON response must include a "content" field of type string.');
  }

  // If content is empty string, return original content. Otherwise, return new content.
  return parsed.content || fileContent;
}


/**
 * Main action function for the Quality Expert skill.
 * @param {object} context - The action context.
 * @param {object} context.llmAgent - The LLM agent.
 * @param {string} context.promptText - The full prompt text for the action.
 * @returns {Promise<string>} The result of the quality review.
 */
export async function action(context) {
  const { llmAgent, promptText } = context;
  if (!llmAgent || !promptText) {
      throw new Error("quality-expert: Missing required 'llmAgent' or 'promptText' in context.");
  }
  const sanitizedPrompt = stripDependsOn(promptText);
  return await executeQualityReview({ prompt: sanitizedPrompt, llmAgent });
}