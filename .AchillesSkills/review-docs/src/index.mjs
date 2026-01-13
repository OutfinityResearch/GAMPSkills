import { promises as fs } from 'fs';
import path from 'path';
import { buildReviewPrompt } from './prompts.mjs';

/**
 * Recursively find all .html files under docs/ within targetDir.
 * @param {string} targetDirAbs - Absolute path to the target directory.
 * @returns {Promise<string[]>} - Array of absolute paths to .html files.
 */
async function discoverHtmlDocs(targetDirAbs) {
  const docsDir = path.join(targetDirAbs, 'docs');

  try {
    const stats = await fs.stat(docsDir);
    if (!stats.isDirectory()) {
      return [];
    }
  } catch {
    // docs directory doesn't exist; no docs to process
    return [];
  }

  /** @type {string[]} */
  const results = [];

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && fullPath.toLowerCase().endsWith('.html')) {
        results.push(fullPath);
      }
    }
  }

  await walk(docsDir);
  return results;
}

/**
 * Normalize a single evaluation entry from the LLM.
 * @param {any} raw
 * @returns {{ description: string, status: 'ok'|'needs-info'|'broken', issues: string[], proposedFixes: string[] }}
 */
function normalizeEvaluationEntry(raw) {
  const safe = (val, fallback) =>
    typeof val === 'string' && val.trim() ? val.trim() : fallback;

  const description = safe(raw?.description, 'No description provided.');
  let status = safe(raw?.status, 'needs-info');
  if (!['ok', 'needs-info', 'broken'].includes(status)) {
    status = 'needs-info';
  }

  const normalizeArray = (val) => {
    if (Array.isArray(val)) {
      return val
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter(Boolean);
    }
    if (typeof val === 'string' && val.trim()) {
      return [val.trim()];
    }
    return [];
  };

  const issues = normalizeArray(raw?.issues);
  const proposedFixes = normalizeArray(raw?.proposedFixes);

  return { description, status, issues, proposedFixes };
}

/**
 * Invoke the LLM agent to evaluate documentation.
 * @param {Function} llmAgent - Function that accepts a prompt string and returns JSON-parseable content.
 * @param {Record<string,string>} docsMap - Map of relative path -> file content.
 * @returns {Promise<Record<string, { description: string, status: string, issues: string[], proposedFixes: string[] }>>}
 */
async function evaluateDocsWithLLM(llmAgent, docsMap) {
  const prompt = buildReviewPrompt({ docsMap });
  const rawResponse = await llmAgent(prompt);

  let parsed;
  try {
    if (typeof rawResponse === 'string') {
      parsed = JSON.parse(rawResponse);
    } else if (typeof rawResponse === 'object' && rawResponse !== null) {
      parsed = rawResponse;
    } else {
      throw new Error('Unsupported llmAgent response type');
    }
  } catch (err) {
    throw new Error(`Failed to parse LLM response as JSON: ${err.message}`);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('LLM response root must be an object');
  }

  /** @type {Record<string, { description: string, status: string, issues: string[], proposedFixes: string[] }>} */
  const evaluations = {};

  for (const [filePath, value] of Object.entries(parsed)) {
    evaluations[filePath] = normalizeEvaluationEntry(value);
  }

  return evaluations;
}

/**
 * Parse existing docs_backlog.md into a structured map.
 * Structure:
 * {
 *   entries: {
 *     [filePath]: {
 *       heading: string,
 *       bodyLines: string[]
 *     }
 *   },
 *   preambleLines: string[]
 * }
 * Preamble is any content before the first '## ' heading.
 * @param {string} content
 */
function parseBacklog(content) {
  const lines = content.split(/\r?\n/);
  const preambleLines = [];
  /** @type {Record<string, { heading: string, bodyLines: string[] }>} */
  const entries = {};

  let currentFile = null;
  let currentHeading = null;
  /** @type {string[]} */
  let currentBody = [];
  let inFirstSection = false;

  for (const line of lines) {
    const headingMatch = /^##\s+(.+)$/.exec(line);
    if (headingMatch) {
      // Save previous section if exists
      if (currentFile !== null) {
        entries[currentFile] = {
          heading: currentHeading,
          bodyLines: currentBody,
        };
      }

      currentHeading = line;
      currentBody = [];
      currentFile = headingMatch[1].trim();
      inFirstSection = true;
    } else if (!inFirstSection) {
      preambleLines.push(line);
    } else if (currentFile !== null) {
      currentBody.push(line);
    }
  }

  if (currentFile !== null) {
    entries[currentFile] = {
      heading: currentHeading,
      bodyLines: currentBody,
    };
  }

  return { preambleLines, entries };
}

/**
 * Render backlog content from structured data and evaluations.
 * @param {{
 *   preambleLines: string[],
 *   existingEntries: Record<string, { heading: string, bodyLines: string[] }>,
 *   evaluations: Record<string, { description: string, status: string, issues: string[], proposedFixes: string[] }>
 * }} params
 * @returns {string}
 */
function renderBacklog({ preambleLines, existingEntries, evaluations }) {
  const lines = [];

  if (preambleLines.length > 0) {
    lines.push(...preambleLines);
    if (preambleLines[preambleLines.length - 1] !== '') {
      lines.push('');
    }
  }

  // Collect all file paths from existingEntries and evaluations
  const filePaths = new Set([
    ...Object.keys(existingEntries),
    ...Object.keys(evaluations),
  ]);

  const sortedPaths = Array.from(filePaths).sort((a, b) =>
    a.localeCompare(b)
  );

  let firstSection = lines.length === 0;

  for (const filePath of sortedPaths) {
    const evaluation = evaluations[filePath];
    const existing = existingEntries[filePath];

    if (!firstSection) {
      lines.push('');
    }
    firstSection = false;

    // Heading must follow the canonical format
    lines.push(`## ${filePath}`);

    // If we don't have an evaluation, keep the existing section's body intact.
    if (!evaluation) {
      if (existing && existing.bodyLines) {
        lines.push(...existing.bodyLines);
      }
      continue;
    }

    // Render automated evaluation, replacing any previous auto content.
    const { description, status, issues, proposedFixes } = evaluation;

    lines.push(`- Description: ${description}`);
    lines.push(`- Status: ${status}`);

    if (!issues || issues.length === 0) {
      lines.push(`- Issues: none`);
    } else {
      lines.push(`- Issues:`);
      for (const issue of issues) {
        lines.push(`  - ${issue}`);
      }
    }

    if (!proposedFixes || proposedFixes.length === 0) {
      lines.push(`- Proposed fixes: none`);
    } else {
      lines.push(`- Proposed fixes:`);
      for (const fix of proposedFixes) {
        lines.push(`  - ${fix}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Orchestrates the review of HTML docs under targetDir/docs and updates docs_backlog.md.
 *
 * @param {object} options
 * @param {string} options.targetDir - Target directory containing a docs/ subdirectory.
 * @param {Function} options.llmAgent - Function to call with the constructed prompt.
 * @returns {Promise<string>} Summary of work performed.
 */
export async function reviewDocs({ targetDir, llmAgent }) {
  if (typeof targetDir !== 'string' || !targetDir.trim()) {
    throw new Error('targetDir must be a non-empty string');
  }
  if (typeof llmAgent !== 'function') {
    throw new Error('llmAgent must be a function');
  }

  const targetDirAbs = path.resolve(targetDir);

  let stats;
  try {
    stats = await fs.stat(targetDirAbs);
  } catch {
    throw new Error(`targetDir does not exist: ${targetDirAbs}`);
  }
  if (!stats.isDirectory()) {
    throw new Error(`targetDir is not a directory: ${targetDirAbs}`);
  }

  const htmlFilesAbs = await discoverHtmlDocs(targetDirAbs);
  const htmlFilesRel = htmlFilesAbs.map((abs) =>
    path.relative(targetDirAbs, abs).split(path.sep).join('/')
  );

  if (htmlFilesAbs.length === 0) {
    // Ensure docs directory exists for backlog file creation
    const docsDir = path.join(targetDirAbs, 'docs');
    await fs.mkdir(docsDir, { recursive: true });
    const backlogPath = path.join(docsDir, 'docs_backlog.md');

    let preambleLines = ['# Documentation Backlog', ''];
    let existingEntries = {};
    try {
      const existing = await fs.readFile(backlogPath, 'utf8');
      const parsed = parseBacklog(existing);
      preambleLines = parsed.preambleLines.length
        ? parsed.preambleLines
        : preambleLines;
      existingEntries = parsed.entries;
    } catch {
      // No existing backlog; we'll create one with just the preamble.
    }

    const backlogContent = renderBacklog({
      preambleLines,
      existingEntries,
      evaluations: {},
    });

    await fs.writeFile(backlogPath, backlogContent, 'utf8');
    return `No HTML documentation files found under ${path.join(
      targetDirAbs,
      'docs'
    )}. docs_backlog.md ensured.`;
  }

  /** @type {Record<string,string>} */
  const docsMap = {};
  for (let i = 0; i < htmlFilesAbs.length; i++) {
    const abs = htmlFilesAbs[i];
    const rel = htmlFilesRel[i];
    const content = await fs.readFile(abs, 'utf8');
    docsMap[rel] = content;
  }

  /** @type {Record<string, { description: string, status: string, issues: string[], proposedFixes: string[] }>} */
  let evaluations = {};

  try {
    const llmEvaluations = await evaluateDocsWithLLM(llmAgent, docsMap);

    // Ensure all discovered files have an entry
    for (const rel of htmlFilesRel) {
      const rawEntry = llmEvaluations[rel] ?? {};
      evaluations[rel] = normalizeEvaluationEntry(rawEntry);
    }
  } catch (err) {
    // On any error, mark all as needs-info
    for (const rel of htmlFilesRel) {
      evaluations[rel] = normalizeEvaluationEntry({
        description: `Automatic analysis failed: ${err.message}`,
        status: 'needs-info',
        issues: [
          'LLM-based evaluation could not be completed due to an internal error.',
        ],
        proposedFixes: [
          'Re-run the documentation review once the LLM service is available.',
        ],
      });
    }
  }

  const docsDir = path.join(targetDirAbs, 'docs');
  await fs.mkdir(docsDir, { recursive: true });
  const backlogPath = path.join(docsDir, 'docs_backlog.md');

  let preambleLines = ['# Documentation Backlog', ''];
  let existingEntries = {};
  try {
    const existingContent = await fs.readFile(backlogPath, 'utf8');
    const parsed = parseBacklog(existingContent);
    preambleLines = parsed.preambleLines.length
      ? parsed.preambleLines
      : preambleLines;
    existingEntries = parsed.entries;
  } catch {
    // No existing backlog; we'll create one.
  }

  const backlogContent = renderBacklog({
    preambleLines,
    existingEntries,
    evaluations,
  });

  await fs.writeFile(backlogPath, backlogContent, 'utf8');

  return `Processed ${htmlFilesAbs.length} documentation file(s) and updated docs/docs_backlog.md.`;
}

export default reviewDocs;