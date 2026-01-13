import fs from 'fs/promises';
import path from 'path';
import { buildInitPrompt } from './prompts.mjs';

/**
 * Initialize project docs/spec backlogs and ask for missing spec details.
 *
 * @param {object} deps
 * @param {(prompt: string) => Promise<string|object>} deps.llmAgent - Injected LLM agent.
 * @returns {(input: string) => Promise<string>}
 */
export function createInitProjectOrchestrator({ llmAgent }) {
  if (typeof llmAgent !== 'function') {
    throw new TypeError('createInitProjectOrchestrator: llmAgent (function) is required');
  }

  /**
   * Main orchestrator entry point.
   *
   * @param {string} input - "<targetDir> [optional project blueprint text...]"
   * @returns {Promise<string>} Summary of actions taken.
   */
  return async function initProjectOrchestrator(input) {
    if (typeof input !== 'string' || !input.trim()) {
      throw new TypeError('initProjectOrchestrator: input must be a non-empty string');
    }

    const { targetDir, userPrompt } = parseInput(input);
    const absTargetDir = path.resolve(process.cwd(), targetDir);

    await ensureBaseStructure(absTargetDir);

    const prompt = buildInitPrompt(userPrompt);
    const llmRawResult = await llmAgent(prompt);

    const llmResult = await normalizeLlmResult(llmRawResult);

    await writeBacklogs(absTargetDir, llmResult);

    return buildSummary(absTargetDir, llmResult);
  };
}

/**
 * Parse the single-line input into targetDir and userPrompt.
 *
 * @param {string} input
 * @returns {{ targetDir: string, userPrompt: string }}
 */
function parseInput(input) {
  const trimmed = input.trim();
  const [firstToken, ...rest] = trimmed.split(/\s+/);
  if (!firstToken) {
    throw new Error('No target directory provided in input');
  }
  const targetDir = firstToken;
  const userPrompt = rest.join(' ').trim();
  return { targetDir, userPrompt };
}

/**
 * Ensure the directory structure exists.
 *
 * @param {string} absTargetDir
 */
async function ensureBaseStructure(absTargetDir) {
  const dirsToCreate = [
    absTargetDir,
    path.join(absTargetDir, 'docs'),
    path.join(absTargetDir, 'docs', 'specs'),
    path.join(absTargetDir, 'docs', 'gamp'),
    path.join(absTargetDir, 'docs', 'specs', 'src'),
    path.join(absTargetDir, 'docs', 'specs', 'tests'),
  ];

  // Use mkdir with { recursive: true } for idempotency.
  for (const dir of dirsToCreate) {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Normalize the LLM result into an object { status, issues, proposedFixes }.
 *
 * @param {string|object} llmRawResult
 * @returns {Promise<{status: string, issues: any[], proposedFixes: any[]}>}
 */
async function normalizeLlmResult(llmRawResult) {
  let parsed;

  if (typeof llmRawResult === 'string') {
    const trimmed = llmRawResult.trim();

    // Try to find a JSON block inside code fences or plain text.
    const jsonMatch =
      trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i) ||
      trimmed.match(/(\{[\s\S]*\})/);

    const jsonCandidate = jsonMatch ? jsonMatch[1] : trimmed;

    try {
      parsed = JSON.parse(jsonCandidate);
    } catch {
      // Fallback to a minimal broken structure.
      return {
        status: 'broken',
        issues: [
          'LLM response could not be parsed as JSON. Please re-run spec assessment.',
        ],
        proposedFixes: [],
      };
    }
  } else if (typeof llmRawResult === 'object' && llmRawResult !== null) {
    parsed = llmRawResult;
  } else {
    return {
      status: 'broken',
      issues: ['LLM response had unexpected type.'],
      proposedFixes: [],
    };
  }

  const status = typeof parsed.status === 'string' ? parsed.status : 'needs-info';
  const issues = Array.isArray(parsed.issues) ? parsed.issues : [];
  const proposedFixes = Array.isArray(parsed.proposedFixes) ? parsed.proposedFixes : [];

  return { status, issues, proposedFixes };
}

/**
 * Write the specs and docs backlog files.
 *
 * @param {string} absTargetDir
 * @param {{status: string, issues: any[], proposedFixes: any[]}} llmResult
 */
async function writeBacklogs(absTargetDir, llmResult) {
  const specsBacklogPath = path.join(absTargetDir, 'docs', 'specs_backlog.m');
  const docsBacklogPath = path.join(absTargetDir, 'docs', 'docs_backlog');

  const specsContent = buildSpecsBacklogContent(llmResult);
  await fs.writeFile(specsBacklogPath, specsContent, 'utf8');

  const docsPlaceholder =
    '# docs_backlog\n\n' +
    '- [ ] Populate documentation backlog items once initial specs are clarified.\n';
  await fs.writeFile(docsBacklogPath, docsPlaceholder, 'utf8');
}

/**
 * Build the content for docs/specs_backlog.m
 *
 * @param {{status: string, issues: any[], proposedFixes: any[]}} llmResult
 * @returns {string}
 */
function buildSpecsBacklogContent(llmResult) {
  const { status, issues, proposedFixes } = llmResult;

  const serializedIssues = JSON.stringify(issues, null, 2);
  const serializedFixes = JSON.stringify(proposedFixes, null, 2);

  return [
    '## project-questions',
    '',
    `status: ${status}`,
    '',
    '### issues',
    '',
    '```json',
    serializedIssues,
    '```',
    '',
    '### proposedFixes',
    '',
    '```json',
    serializedFixes,
    '```',
    '',
  ].join('\n');
}

/**
 * Build a short, human-readable summary of what was done.
 *
 * @param {string} absTargetDir
 * @param {{status: string, issues: any[], proposedFixes: any[]}} llmResult
 * @returns {string}
 */
function buildSummary(absTargetDir, llmResult) {
  const relDir = absTargetDir;
  const issueCount = Array.isArray(llmResult.issues) ? llmResult.issues.length : 0;
  const fixCount = Array.isArray(llmResult.proposedFixes) ? llmResult.proposedFixes.length : 0;

  return [
    `Initialized project structure at: ${relDir}`,
    'Created directories: docs/, docs/specs/, docs/gamp/, docs/specs/src/, docs/specs/tests/',
    'Generated backlogs: docs/specs_backlog.m, docs/docs_backlog',
    `LLM assessment status: ${llmResult.status} (issues: ${issueCount}, proposedFixes: ${fixCount})`,
  ].join('\n');
}

export default createInitProjectOrchestrator;