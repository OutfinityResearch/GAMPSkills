import fs from 'fs/promises';
import path from 'path';
import { buildInitPrompt } from './prompts.mjs';

export const roles = [];

function toAbsolute(base, inputPath) {
  if (!inputPath) return base;
  return path.isAbsolute(inputPath) ? inputPath : path.join(base, inputPath);
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function toTextEntries(values, fallbackValue) {
  if (!Array.isArray(values) || values.length === 0) return [fallbackValue];
  return values.map((value) => {
    if (value === null || value === undefined) return fallbackValue;
    if (typeof value === 'string') return value;
    try {
      const json = JSON.stringify(value);
      return json === '{}' ? fallbackValue : json;
    } catch {
      return String(value);
    }
  });
}

function renderBacklogSection(relative, evaluation) {
  const issues = toTextEntries(evaluation.issues, 'none');
  const fixes = toTextEntries(evaluation.proposedFixes, 'none');
  const lines = [
    `## ${relative}`,
    `- Status: ${evaluation.status}`,
    `- Issues:`,
    ...issues.map((i) => `  - ${i}`),
    `- Proposed fixes:`,
    ...fixes.map((f) => `  - ${f}`),
    '',
  ];
  return lines.join('\n');
}

function normalizeLLMResult(raw) {
  const fallback = { status: 'needs-info', issues: ['LLM response invalid'], proposedFixes: ['Provide missing project details'] };
  if (!raw || typeof raw !== 'object') return fallback;
  const status = typeof raw.status === 'string' ? raw.status.toLowerCase() : 'needs-info';
  const issues = Array.isArray(raw.issues) ? raw.issues : [];
  const proposedFixes = Array.isArray(raw.proposedFixes) ? raw.proposedFixes : [];
  return {
    status: ['ok', 'needs-info', 'broken'].includes(status) ? status : 'needs-info',
    issues,
    proposedFixes,
  };
}

async function writeSpecsBacklog(targetDir, evaluation) {
  const backlogPath = path.join(targetDir, 'docs', 'specs_backlog.m');
  await ensureDir(path.dirname(backlogPath));
  const content = renderBacklogSection('project-questions', evaluation);
  await fs.writeFile(backlogPath, content, 'utf8');
  return backlogPath;
}

async function writeDocsBacklog(targetDir) {
  const docsBacklogPath = path.join(targetDir, 'docs', 'docs_backlog');
  await ensureDir(path.dirname(docsBacklogPath));
  const content = 'Here will be backlog for docs\n';
  await fs.writeFile(docsBacklogPath, content, 'utf8');
  return docsBacklogPath;
}

async function createDirectories(targetDir) {
  const dirs = [
    path.join(targetDir, 'docs'),
    path.join(targetDir, 'docs', 'specs'),
    path.join(targetDir, 'docs', 'gamp'),
    path.join(targetDir, 'docs', 'specs', 'src'),
    path.join(targetDir, 'docs', 'specs', 'tests'),
  ];
  for (const dir of dirs) {
    await ensureDir(dir);
  }
}

function parseInput(input) {
  if (typeof input !== 'string' || !input.trim()) {
    throw new Error('init-project requires a non-empty string input');
  }
  const trimmed = input.trim();
  const [first, ...rest] = trimmed.split(/\s+/);
  const targetDir = first;
  const prompt = rest.join(' ').trim();
  return { targetDir, prompt };
}

export async function action(context) {
  const { llmAgent, prompt } = context;
  const { targetDir, prompt: userPrompt } = parseInput(prompt || '');
  const baseDir = process.cwd();
  const resolvedTarget = toAbsolute(baseDir, targetDir);
  if (!resolvedTarget) {
    throw new Error('missing targetDir');
  }

  const existed = await pathExists(resolvedTarget);
  if (!existed) {
    await ensureDir(resolvedTarget);
  }

  await createDirectories(resolvedTarget);

  if (!llmAgent || typeof llmAgent.executePrompt !== 'function') {
    throw new Error('llmAgent is required for init-project');
  }

  const llmPrompt = buildInitPrompt(userPrompt || '');
  const raw = await llmAgent.executePrompt(llmPrompt, { responseShape: 'json' });
  const evaluation = normalizeLLMResult(raw);

  const specsBacklogPath = await writeSpecsBacklog(resolvedTarget, evaluation);
  const docsBacklogPath = await writeDocsBacklog(resolvedTarget);

  return `init-project: initialized docs, wrote ${path.relative(resolvedTarget, specsBacklogPath)} and ${path.relative(resolvedTarget, docsBacklogPath)}`;
}
