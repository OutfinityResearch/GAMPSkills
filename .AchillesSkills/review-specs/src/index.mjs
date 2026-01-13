// Review Specs Orchestrator Module
// Orchestrates discovery, LLM review, and backlog updating for spec markdown files.

import { promises as fs } from 'fs';
import path from 'path';
import { buildReviewPrompt } from './prompts.mjs';

/**
 * Recursively walk a directory and return all file paths.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function walk(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        return walk(res);
      }
      return [res];
    })
  );
  return files.flat();
}

/**
 * Discover spec files (.js.md and .md) under targetDir/specs.
 * Returns an array of absolute paths.
 * @param {string} targetDirAbs
 * @returns {Promise<string[]>}
 */
async function discoverSpecFiles(targetDirAbs) {
  const specsRoot = path.join(targetDirAbs, 'specs');
  try {
    const stats = await fs.stat(specsRoot);
    if (!stats.isDirectory()) {
      return [];
    }
  } catch {
    // specs directory does not exist
    return [];
  }

  const allFiles = await walk(specsRoot);
  const specFiles = allFiles.filter((file) => {
    const ext = path.extname(file);
    if (ext === '.md') {
      return true;
    }
    // `.js.md` ends with `.md`; we already accept .md so no extra needed
    return false;
  });

  specFiles.sort((a, b) => a.localeCompare(b));
  return specFiles;
}

/**
 * Attempt to parse JSON from LLM text and normalize it.
 * @param {string} text
 * @returns {{ description: string, status: 'ok'|'needs-info'|'broken', issues: string[], proposedFixes: string[] }}
 */
function normalizeLlmResponse(text) {
  let parsed;
  try {
    // Trim and attempt to parse; if content around JSON exists, try to extract middle.
    const trimmed = text.trim();
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      const firstBrace = trimmed.indexOf('{');
      const lastBrace = trimmed.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const maybeJson = trimmed.slice(firstBrace, lastBrace + 1);
        parsed = JSON.parse(maybeJson);
      } else {
        throw new Error('No JSON object found in LLM response');
      }
    }
  } catch (err) {
    return {
      description: 'Failed to parse LLM response as JSON',
      status: 'needs-info',
      issues: [`LLM response parsing error: ${err.message}`],
      proposedFixes: ['Retry the review or inspect the specification manually.'],
    };
  }

  const description =
    typeof parsed.description === 'string'
      ? parsed.description.trim()
      : 'No description provided by LLM';

  const validStatuses = ['ok', 'needs-info', 'broken'];
  const status = validStatuses.includes(parsed.status) ? parsed.status : 'needs-info';

  const issues =
    Array.isArray(parsed.issues) && parsed.issues.every((i) => typeof i === 'string')
      ? parsed.issues
      : ['LLM did not return a valid issues array.'];

  const proposedFixes =
    Array.isArray(parsed.proposedFixes) &&
    parsed.proposedFixes.every((f) => typeof f === 'string')
      ? parsed.proposedFixes
      : ['LLM did not return valid proposed fixes.'];

  return { description, status, issues, proposedFixes };
}

/**
 * Parse the existing specs_backlog.md file into a map keyed by relative path.
 * Each entry value is the full text block for that section (heading + lines).
 *
 * This parser is intentionally tolerant: it captures sections beginning with
 * "## " and uses the remainder of the file around them as-is where possible.
 *
 * @param {string} backlogContent
 * @returns {{ sections: Map<string,string>, preamble: string }}
 */
function parseBacklog(backlogContent) {
  const lines = backlogContent.split('\n');
  const sections = new Map();
  let currentPath = null;
  let currentLines = [];
  let preambleLines = [];
  let inAnySection = false;

  for (const line of lines) {
    const headingMatch = /^##\s+(.+)$/.exec(line);
    if (headingMatch) {
      // Save previous section if any
      if (currentPath !== null) {
        sections.set(currentPath, currentLines.join('\n').trimEnd());
      } else if (!inAnySection) {
        preambleLines = currentLines;
      }
      inAnySection = true;
      currentPath = headingMatch[1].trim();
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  if (currentPath !== null) {
    sections.set(currentPath, currentLines.join('\n').trimEnd());
  } else if (!inAnySection) {
    preambleLines = currentLines;
  }

  const preamble = preambleLines.join('\n').trimEnd();
  return { sections, preamble };
}

/**
 * Format a single backlog section for a spec file.
 *
 * @param {string} relativePath
 * @param {{ description: string, status: 'ok'|'needs-info'|'broken', issues: string[], proposedFixes: string[] }} evaluation
 * @returns {string}
 */
function formatBacklogSection(relativePath, evaluation) {
  const { description, status, issues, proposedFixes } = evaluation;

  const issuesLines =
    !issues || issues.length === 0 || (issues.length === 1 && issues[0] === 'none')
      ? ['- Issues: none']
      : ['- Issues:', ...issues.map((i) => `  - ${i}`)];

  const fixesLines =
    !proposedFixes ||
    proposedFixes.length === 0 ||
    (proposedFixes.length === 1 && proposedFixes[0] === 'none')
      ? ['- Proposed fixes: none']
      : ['- Proposed fixes:', ...proposedFixes.map((f) => `  - ${f}`)];

  const lines = [
    `## ${relativePath}`,
    `- Description: ${description}`,
    `- Status: ${status}`,
    ...issuesLines,
    ...fixesLines,
    '',
  ];

  return lines.join('\n');
}

/**
 * Merge new evaluations into an existing backlog content string.
 *
 * @param {string | null} existingContent
 * @param {Array<{ relativePath: string, evaluation: { description: string, status: string, issues: string[], proposedFixes: string[] } }>} evaluations
 * @returns {string}
 */
function mergeBacklog(existingContent, evaluations) {
  const normalizedExisting = typeof existingContent === 'string' ? existingContent : '';
  const { sections: existingSections, preamble } = parseBacklog(normalizedExisting);

  for (const { relativePath, evaluation } of evaluations) {
    const sectionText = formatBacklogSection(relativePath, evaluation);
    existingSections.set(relativePath, sectionText.trimEnd());
  }

  const sortedPaths = Array.from(existingSections.keys()).sort((a, b) =>
    a.localeCompare(b)
  );

  const mergedSections = sortedPaths.map((p) => existingSections.get(p));

  const parts = [];
  if (preamble) {
    parts.push(preamble.trimEnd());
  }
  if (mergedSections.length > 0) {
    if (parts.length > 0) parts.push('');
    parts.push(mergedSections.join('\n\n'));
  }

  return parts.join('\n').trimEnd() + '\n';
}

/**
 * Main orchestrator.
 *
 * @param {Object} params
 * @param {string} params.targetDir - Base directory of the project.
 * @param {(prompt: string) => Promise<string>} params.llmAgent - Function that calls the LLM and returns raw text.
 * @returns {Promise<string>} Summary string.
 */
export async function action(context) {
  const { args, llmAgent, prompt } = context;
  
  // If invoked via executeWithReviewMode(targetDir, ...), targetDir might be the prompt
  // OR it might be in args.targetDir
  let targetDir = args?.targetDir;
  
  if (!targetDir && typeof prompt === 'string' && prompt.trim().length > 0) {
     targetDir = prompt.trim();
  }

  if (!targetDir) {
    throw new Error('review-specs action: targetDir is required (passed as prompt or args.targetDir)');
  }

  // Ensure llmAgent is wrapped correctly if it's an object with executePrompt
  const wrappedLlmAgent = typeof llmAgent === 'function' 
      ? llmAgent 
      : (llmAgent && typeof llmAgent.executePrompt === 'function')
          ? ((prompt) => llmAgent.executePrompt(prompt))
          : null;

  if (!wrappedLlmAgent) {
      throw new Error('review-specs action: valid llmAgent function or object required');
  }

  return reviewSpecsOrchestrator({ targetDir, llmAgent: wrappedLlmAgent });
}

/**
 * Internal orchestrator logic (kept for clarity, though called directly by action)
 */
async function reviewSpecsOrchestrator({ targetDir, llmAgent }) {
  if (typeof targetDir !== 'string' || targetDir.trim() === '') {
    throw new TypeError('reviewSpecsOrchestrator: targetDir must be a non-empty string');
  }
  if (typeof llmAgent !== 'function') {
    throw new TypeError('reviewSpecsOrchestrator: llmAgent must be a function');
  }

  const targetDirAbs = path.resolve(targetDir);

  // Ensure target directory exists
  const stats = await fs
    .stat(targetDirAbs)
    .catch(() => {
      throw new Error(`Target directory does not exist: ${targetDirAbs}`);
    });
  if (!stats.isDirectory()) {
    throw new Error(`Target path is not a directory: ${targetDirAbs}`);
  }

  // Discover spec files
  const specFilesAbs = await discoverSpecFiles(targetDirAbs);

  // Prepare evaluations
  const evaluations = [];

  for (const absPath of specFilesAbs) {
    const relPath = path.relative(targetDirAbs, absPath).replace(/\\/g, '/');
    let evaluation;

    try {
      const content = await fs.readFile(absPath, 'utf8');
      const prompt = buildReviewPrompt({ specContent: content, relativePath: relPath });

      const rawResponse = await llmAgent(prompt);
      evaluation = normalizeLlmResponse(String(rawResponse));
    } catch (err) {
      evaluation = {
        description: `Automatic review failed: ${err.message}`,
        status: 'needs-info',
        issues: ['Orchestrator encountered an error when processing this spec.'],
        proposedFixes: [
          'Inspect the orchestrator logs and re-run the review, or review this spec manually.',
        ],
      };
    }

    evaluations.push({ relativePath: relPath, evaluation });
  }

  // Backlog management
  const docsDir = path.join(targetDirAbs, 'docs');
  const backlogPath = path.join(docsDir, 'specs_backlog.md');

  let existingBacklog = null;
  try {
    existingBacklog = await fs.readFile(backlogPath, 'utf8');
  } catch {
    // No existing backlog; that's fine.
  }

  const mergedBacklog = mergeBacklog(existingBacklog, evaluations);

  await fs.mkdir(docsDir, { recursive: true });
  await fs.writeFile(backlogPath, mergedBacklog, 'utf8');

  const summary = `Processed ${evaluations.length} spec file(s). Updated backlog at ${path.relative(
    targetDirAbs,
    backlogPath
  )}.`;

  return summary;
}