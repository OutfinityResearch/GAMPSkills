import { readFile, stat } from 'fs/promises';
import { resolve } from 'path';
import { parse, render, readBacklog, writeBacklog } from './backlogIO.mjs';
import { normalizeIssue, ChangeQueue, nextAllowed } from './backlogDomain.mjs';

export async function loadBacklog(type) {
  if (!['specs', 'docs'].includes(type)) {
    throw new Error(`Invalid type: ${type}`);
  }
  const path = resolve(`./${type}_backlog.md`);
  const rawContent = await readBacklog(path);
  const sections = parse(rawContent);
  const stats = await stat(path);
  const meta = { mtime: stats.mtime, size: stats.size };
  return { sections, meta };
}

export async function getSection(type, fileKey) {
  const { sections } = await loadBacklog(type);
  return sections[fileKey] || null;
}

export async function recordIssue(type, relativeFilePath, issue) {
  const { sections } = await loadBacklog(type);
  const section = sections[relativeFilePath];
  if (!section) return null;
  const normalized = normalizeIssue(issue);
  normalized.id = section.issues.length + 1;
  section.issues.push(normalized);
  await saveBacklog(type, sections);
  return section;
}

export async function proposeFix(type, relativeFilePath, proposal) {
  const { sections } = await loadBacklog(type);
  const section = sections[relativeFilePath];
  if (!section) return null;
  const normalized = normalizeIssue(proposal); // reuse
  normalized.id = section.options.length + 1;
  section.options.push(normalized);
  await saveBacklog(type, sections);
  return section;
}

export async function approveResolution(type, relativeFilePath, resolutionString) {
  const { sections } = await loadBacklog(type);
  const section = sections[relativeFilePath];
  if (!section) return null;
  section.resolution = resolutionString;
  // Update status if resolution is set
  if (resolutionString.trim()) {
    section.status = 'ok';
  }
  await saveBacklog(type, sections);
  return section;
}

export async function applyChanges(type, relativeFilePath, approvedItems, hooks) {
  const { sections } = await loadBacklog(type);
  const section = sections[relativeFilePath];
  if (!section) return null;
  const queue = new ChangeQueue();
  for (const item of approvedItems) {
    queue.enqueue(relativeFilePath, item);
  }
  const changes = queue.drain();
  for (const change of changes) {
    // Assume change is an object with type: 'issue' or 'option', id
    if (change.type === 'issue') {
      // Call hook, e.g., hooks.applySpecFix
      if (hooks.applySpecFix) {
        hooks.applySpecFix(section, change);
      }
    } else if (change.type === 'option') {
      if (hooks.applyDocFix) {
        hooks.applyDocFix(section, change);
      }
    }
  }
  // Update status
  section.status = 'ok';
  await saveBacklog(type, sections);
  return changes;
}

export async function saveBacklog(type, sections) {
  const path = resolve(`./${type}_backlog.md`);
  const content = render(sections);
  await writeBacklog(path, content);
}

export async function findSectionsByPrefix(type, prefix) {
  const { sections } = await loadBacklog(type);
  const names = [];
  for (const key of Object.keys(sections)) {
    if (key.startsWith(prefix)) {
      names.push(key);
    }
  }
  return names;
}

export async function findSectionByFileName(type, fileName) {
  const { sections } = await loadBacklog(type);
  for (const [key, section] of Object.entries(sections)) {
    if (key.endsWith(fileName)) {
      return key;
    }
  }
  return null;
}

export async function findSectionsByStatus(type, status) {
  const { sections } = await loadBacklog(type);
  const names = [];
  for (const [key, section] of Object.entries(sections)) {
    if (section.status === status) {
      names.push(key);
    }
  }
  return names;
}

export async function setStatus(type, relativeFilePath, status) {
  const { sections } = await loadBacklog(type);
  const section = sections[relativeFilePath];
  if (section) {
    section.status = status;
  }
  await saveBacklog(type, sections);
}

export async function updateSection(type, relativeFilePath, updates) {
  const { sections } = await loadBacklog(type);
  const section = sections[relativeFilePath];
  if (section) {
    Object.assign(section, updates);
  }
  await saveBacklog(type, sections);
}

export async function appendSection(type, relativeFilePath, initialContent) {
  const { sections } = await loadBacklog(type);
  if (!sections[relativeFilePath]) {
    sections[relativeFilePath] = {
      name: relativeFilePath,
      description: initialContent,
      status: 'needs_work',
      issues: [],
      options: [],
      resolution: ''
    };
  }
  await saveBacklog(type, sections);
}

