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
  const tasks = parse(rawContent);
  const stats = await stat(path);
  const meta = { mtime: stats.mtime, size: stats.size };
  return { tasks, meta };
}

export async function getTask(type, fileKey) {
  const { tasks } = await loadBacklog(type);
  return tasks[fileKey] || null;
}

export async function recordIssue(type, relativeFilePath, issue) {
  const { tasks } = await loadBacklog(type);
  const task = tasks[relativeFilePath];
  if (!task) return null;
  const normalized = normalizeIssue(issue);
  normalized.id = task.issues.length + 1;
  task.issues.push(normalized);
  await saveBacklog(type, tasks);
  return task;
}

export async function proposeFix(type, relativeFilePath, proposal) {
  const { tasks } = await loadBacklog(type);
  const task = tasks[relativeFilePath];
  if (!task) return null;
  const normalized = normalizeIssue(proposal); // reuse
  normalized.id = task.options.length + 1;
  task.options.push(normalized);
  await saveBacklog(type, tasks);
  return task;
}

export async function approveResolution(type, relativeFilePath, resolutionString) {
  const { tasks } = await loadBacklog(type);
  const task = tasks[relativeFilePath];
  if (!task) return null;
  task.resolution = resolutionString;
  // Update status if resolution is set
  if (resolutionString.trim()) {
    task.status = 'ok';
  }
  await saveBacklog(type, tasks);
  return task;
}

export async function applyChanges(type, relativeFilePath, approvedItems, hooks) {
  const { tasks } = await loadBacklog(type);
  const task = tasks[relativeFilePath];
  if (!task) return null;
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
        hooks.applySpecFix(task, change);
      }
    } else if (change.type === 'option') {
      if (hooks.applyDocFix) {
        hooks.applyDocFix(task, change);
      }
    }
  }
  // Update status
  task.status = 'ok';
  await saveBacklog(type, tasks);
  return changes;
}

export async function saveBacklog(type, tasks) {
  const path = resolve(`./${type}_backlog.md`);
  const content = render(tasks);
  await writeBacklog(path, content);
}

export async function findTasksByPrefix(type, prefix) {
  const { tasks } = await loadBacklog(type);
  const names = [];
  for (const key of Object.keys(tasks)) {
    if (key.startsWith(prefix)) {
      names.push(key);
    }
  }
  return names;
}

export async function findTaskByFileName(type, fileName) {
  const { tasks } = await loadBacklog(type);
  for (const [key, task] of Object.entries(tasks)) {
    if (key.endsWith(fileName)) {
      return key;
    }
  }
  return null;
}

export async function findTasksByStatus(type, status) {
  const { tasks } = await loadBacklog(type);
  const names = [];
  for (const [key, task] of Object.entries(tasks)) {
    if (task.status === status) {
      names.push(key);
    }
  }
  return names;
}

export async function setStatus(type, relativeFilePath, status) {
  const { tasks } = await loadBacklog(type);
  const task = tasks[relativeFilePath];
  if (task) {
    task.status = status;
  }
  await saveBacklog(type, tasks);
}

export async function updateTask(type, relativeFilePath, updates) {
  const { tasks } = await loadBacklog(type);
  const task = tasks[relativeFilePath];
  if (task) {
    Object.assign(task, updates);
  }
  await saveBacklog(type, tasks);
}

export async function appendTask(type, relativeFilePath, initialContent) {
  const { tasks } = await loadBacklog(type);
  if (!tasks[relativeFilePath]) {
    tasks[relativeFilePath] = {
      name: relativeFilePath,
      description: initialContent,
      status: 'needs_work',
      issues: [],
      options: [],
      resolution: ''
    };
  }
  await saveBacklog(type, tasks);
}

