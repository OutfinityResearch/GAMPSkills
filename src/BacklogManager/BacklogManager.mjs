import { stat } from 'fs/promises';
import { resolve } from 'path';
import { parse, render, readBacklog, writeBacklog } from './backlogIO.mjs';
import { ChangeQueue } from './backlogDomain.mjs';

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

export async function getTask(type, taskId) {
  const { tasks } = await loadBacklog(type);
  return tasks[String(taskId)] || null;
}

export async function proposeFix(type, taskId, proposal) {
  const { tasks } = await loadBacklog(type);
  const task = tasks[String(taskId)];
  if (!task) return null;
  const normalized = normalizeProposal(proposal);
  normalized.id = task.options.length + 1;
  task.options.push(normalized);
  await saveBacklog(type, tasks);
  return task;
}

export async function approveResolution(type, taskId, resolutionString) {
  const { tasks } = await loadBacklog(type);
  const task = tasks[String(taskId)];
  if (!task) return null;
  task.resolution = resolutionString;
  // Update status if resolution is set
  if (resolutionString.trim()) {
    task.status = 'ok';
  }
  await saveBacklog(type, tasks);
  return task;
}

export async function applyChanges(type, taskId, approvedItems, hooks) {
  const { tasks } = await loadBacklog(type);
  const task = tasks[String(taskId)];
  if (!task) return null;
  const queue = new ChangeQueue();
  for (const item of approvedItems) {
    queue.enqueue(String(taskId), item);
  }
  const changes = queue.drain();
  for (const change of changes) {
    // Assume change is an object with type and id
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

export async function setStatus(type, taskId, status) {
  const { tasks } = await loadBacklog(type);
  const task = tasks[String(taskId)];
  if (task) {
    task.status = status;
  }
  await saveBacklog(type, tasks);
}

export async function updateTask(type, taskId, updates) {
  const { tasks } = await loadBacklog(type);
  const task = tasks[String(taskId)];
  if (task) {
    Object.assign(task, updates);
  }
  await saveBacklog(type, tasks);
}

export async function appendTask(type, initialContent) {
  const { tasks } = await loadBacklog(type);
  const nextId = getNextTaskId(tasks);
  tasks[String(nextId)] = {
    id: nextId,
    description: initialContent,
    status: 'needs_work',
    affectedFiles: [],
    options: [],
    resolution: ''
  };
  await saveBacklog(type, tasks);
}

function getNextTaskId(tasks) {
  const ids = Object.keys(tasks)
    .map((key) => Number.parseInt(key, 10))
    .filter((value) => Number.isFinite(value));
  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  return maxId + 1;
}

function normalizeProposal(raw) {
  let title = '';
  let details = '';
  let status = '';

  if (typeof raw === 'string') {
    title = raw;
  } else if (typeof raw === 'object' && raw) {
    title = raw.title || '';
    details = raw.details || '';
    status = raw.status || '';
  }

  return { id: 0, title, details, status };
}
