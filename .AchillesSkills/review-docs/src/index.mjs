import fs from 'fs/promises';
import path from 'path';
import { buildReviewPrompt } from './prompts.mjs';

function toAbsolute(base, inputPath) {
  if (!inputPath) return base;
  return path.isAbsolute(inputPath) ? inputPath : path.join(base, inputPath);
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function parseInput(input) {
  if (typeof input !== 'string' || !input.trim()) {
    throw new Error('review-docs requires a non-empty string input representing targetDir');
  }
  return { targetDir: input.trim() };
}

async function readIfExists(p) {
  try {
    return await fs.readFile(p, 'utf8');
  } catch {
    return null;
  }
}

function sortByRelativePath(entries) {
  return [...entries].sort((a, b) => a.relative.localeCompare(b.relative));
}

async function discoverDocs(targetDir) {
  const docsDir = path.join(targetDir, 'docs');
  if (!await pathExists(docsDir)) return [];
  
  const results = [];
  async function walk(dir) {
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        await walk(full);
      } else if (item.isFile() && item.name.endsWith('.html')) {
        const relative = path.relative(targetDir, full);
        results.push({ fullPath: full, relative });
      }
    }
  }
  await walk(docsDir);
  return results;
}

function normalizeLLMResult(raw, docFiles) {
  const normalized = [];
  if (!raw || typeof raw !== 'object') return [];

  for (const doc of docFiles) {
    const evalRaw = raw[doc.relative] || { description: 'No description provided', status: 'needs-info', issues: ['Not analyzed by LLM'], proposedFixes: [] };
    
    const description = typeof evalRaw.description === 'string' ? evalRaw.description : 'No description provided';
    const status = typeof evalRaw.status === 'string' ? evalRaw.status.toLowerCase() : 'needs-info';
    const issues = Array.isArray(evalRaw.issues) ? evalRaw.issues : [];
    const proposedFixes = Array.isArray(evalRaw.proposedFixes) ? evalRaw.proposedFixes : [];
    
    normalized.push({
      relative: doc.relative,
      evaluation: {
        description,
        status: ['ok', 'needs-info', 'broken'].includes(status) ? status : 'needs-info',
        issues,
        proposedFixes,
      }
    });
  }
  return normalized;
}

function renderSection(relative, evaluation) {
  const issues = evaluation.issues?.length ? evaluation.issues : ['none'];
  const fixes = evaluation.proposedFixes?.length ? evaluation.proposedFixes : ['none'];
  const lines = [
    `## ${relative}`,
    `- Description: ${evaluation.description}`,
    `- Status: ${evaluation.status}`,
    `- Issues:`,
    ...issues.map((i) => `  - ${i}`),
    `- Proposed fixes:`,
    ...fixes.map((f) => `  - ${f}`),
    '',
  ];
  return lines.join('\n');
}

function mergeBacklog(existingContent, updates) {
  const sections = new Map();
  const lines = (existingContent || '').split(/\r?\n/);
  let current = null;
  for (const line of lines) {
    const headingMatch = line.startsWith('## ');
    if (headingMatch) {
      current = line.slice(3).trim();
      sections.set(current, [line]);
      continue;
    }
    if (current) {
      sections.get(current).push(line);
    }
  }
  for (const { relative, evaluation } of updates) {
    sections.set(relative, renderSection(relative, evaluation).split('\n'));
  }
  const ordered = sortByRelativePath(Array.from(sections.entries()).map(([relative, linesArr]) => ({ relative, content: linesArr })));
  const outputLines = [];
  for (const entry of ordered) {
    outputLines.push(...entry.content);
  }
  return outputLines.join('\n');
}

async function writeBacklog(targetDir, updates, noDocsNote = false) {
  const backlogPath = path.join(targetDir, 'docs', 'docs_backlog.md');
  await fs.mkdir(path.dirname(backlogPath), { recursive: true });
  const existing = await readIfExists(backlogPath);
  let content;
  if (noDocsNote) {
    const header = '# docs_backlog\n- Note: no documentation files found in docs/\n';
    content = existing ? `${header}\n${existing}` : `${header}\n`;
  } else {
    const header = '# docs_backlog\n';
    const merged = mergeBacklog(existing ? existing.replace('# docs_backlog\n', '') : '', updates);
    content = header + merged;
  }
  await fs.writeFile(backlogPath, content, 'utf8');
  return backlogPath;
}

export async function action(context) {
  const { llmAgent, prompt } = context;
  const { targetDir } = parseInput(prompt || '');
  const baseDir = process.cwd();
  const resolvedTarget = toAbsolute(baseDir, targetDir);

  if (!resolvedTarget) throw new Error('missing targetDir');
  if (!await pathExists(resolvedTarget)) throw new Error('Directory not found');
  if (!llmAgent || typeof llmAgent.executePrompt !== 'function') throw new Error('llmAgent is required for review-docs');

  const docsFiles = await discoverDocs(resolvedTarget);
  if (!docsFiles.length) {
    await writeBacklog(resolvedTarget, [], true);
    return 'review-docs: no html docs found (see docs/docs_backlog.md)';
  }

  const docsMap = {};
  for (const doc of docsFiles) {
    docsMap[doc.relative] = await fs.readFile(doc.fullPath, 'utf8');
  }

  let evaluations = [];
  try {
    const reviewPrompt = buildReviewPrompt({ docsMap });
    const rawResult = await llmAgent.executePrompt(reviewPrompt, { responseShape: 'json' });
    evaluations = normalizeLLMResult(rawResult, docsFiles);
  } catch (error) {
    evaluations = docsFiles.map(d => ({
      relative: d.relative,
      evaluation: { status: 'needs-info', issues: [`LLM Execution Error: ${error.message}`], proposedFixes: [] }
    }));
  }

  await writeBacklog(resolvedTarget, evaluations, false);
  return `review-docs: processed ${docsFiles.length} docs, wrote docs/docs_backlog.md`;
}
