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
  const { tasks, history } = parse(rawContent);
  const stats = await stat(path);
  const meta = { mtime: stats.mtime, size: stats.size };
  return { tasks, history, meta };
}

export async function getTask(type, taskId) {
  const { tasks } = await loadBacklog(type);
  return tasks[String(taskId)] || null;
}

export async function proposeFix(type, taskId, proposal) {
  const { tasks, history } = await loadBacklog(type);
  const task = tasks[String(taskId)];
  if (!task) return null;
  const normalized = normalizeProposal(proposal);
  normalized.id = task.options.length + 1;
  task.options.push(normalized);
  task.resolution = '';
  await saveBacklog(type, { tasks, history });
  return task;
}

export async function addOptionsFromText(type, taskId, text) {
  const { tasks, history } = await loadBacklog(type);
  const task = tasks[String(taskId)];
  if (!task) return null;
  const items = parseOptionsText(text);
  if (items.length === 0) return task;
  let nextId = task.options.length + 1;
  for (const item of items) {
    task.options.push({ id: nextId++, title: item.title, details: item.details, status: '' });
  }
  task.resolution = '';
  await saveBacklog(type, { tasks, history });
  return task;
}

export async function approveResolution(type, taskId, resolutionString) {
  const { tasks, history } = await loadBacklog(type);
  const task = tasks[String(taskId)];
  if (!task) return null;
  task.resolution = resolutionString;
  task.options = [];
  await saveBacklog(type, { tasks, history });
  return task;
}

export async function applyChanges(type, taskId, approvedItems, hooks) {
  const { tasks, history } = await loadBacklog(type);
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
  const doneText = task.resolution || 'Executed.';
  moveTaskToHistory(String(taskId), tasks, history, doneText);
  await saveBacklog(type, { tasks, history });
  return changes;
}

export async function saveBacklog(type, data) {
  const path = resolve(`./${type}_backlog.md`);
  const content = render(data);
  await writeBacklog(path, content);
}

export async function findTasksByStatus(type, status) {
  const { tasks } = await loadBacklog(type);
  const matches = [];
  for (const task of Object.values(tasks)) {
    const inferred = inferStatus(task);
    if (inferred === status) {
      matches.push(task);
    }
  }
  return matches;
}

export async function setStatus(type, taskId, status) {
  const { tasks, history } = await loadBacklog(type);
  const task = tasks[String(taskId)];
  if (!task) {
    await saveBacklog(type, { tasks, history });
    return;
  }

  if (status === 'done') {
    moveTaskToHistory(taskId, tasks, history, task.resolution || 'Executed.');
  }
  await saveBacklog(type, { tasks, history });
}

export async function markDone(type, taskId, doneText) {
  const { tasks, history } = await loadBacklog(type);
  const task = tasks[String(taskId)];
  if (!task) return null;
  const resolution = doneText && doneText.trim() ? doneText.trim() : task.resolution || 'Executed.';
  moveTaskToHistory(taskId, tasks, history, resolution);
  await saveBacklog(type, { tasks, history });
  return history[history.length - 1] || null;
}

export async function updateTask(type, taskId, updates) {
  const { tasks, history } = await loadBacklog(type);
  const task = tasks[String(taskId)];
  if (task) {
    Object.assign(task, updates);
    if (task.resolution) {
      task.options = [];
    }
  }
  if (updates?.status === 'done') {
    moveTaskToHistory(taskId, tasks, history, task.resolution || 'Executed.');
  }
  await saveBacklog(type, { tasks, history });
}

export async function appendTask(type, initialContent) {
  const { tasks, history } = await loadBacklog(type);
  const nextId = getNextTaskId(tasks);
  tasks[String(nextId)] = {
    id: nextId,
    description: initialContent,
    options: [],
    resolution: ''
  };
  await saveBacklog(type, { tasks, history });
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

function parseOptionsText(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split('\n');
  const items = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    const numberedMatch = line.match(/^\s*(\d+)[\.)]\s+(.+)$/);
    const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/);

    if (numberedMatch || bulletMatch) {
      if (current) items.push(current);
      const title = numberedMatch ? numberedMatch[2] : bulletMatch[1];
      current = { title: title.trim(), details: '' };
      continue;
    }

    if (current && line.trim()) {
      const normalized = line.trim();
      current.details = current.details ? `${current.details}\n${normalized}` : normalized;
    }
  }

  if (current) items.push(current);
  return items;
}

function inferStatus(task) {
  if (!task) return '';
  if (task.resolution && task.resolution.trim()) {
    return 'done';
  }
  if (task.options && task.options.length > 0) {
    return 'needs_work';
  }
  return 'needs_work';
}

function moveTaskToHistory(taskId, tasks, history, resolutionText) {
  const task = tasks[String(taskId)];
  if (!task) return;
  const resolution = resolutionText && resolutionText.trim() ? resolutionText.trim() : task.resolution && task.resolution.trim() ? task.resolution : 'Executed.';
  history.push({
    id: history.length + 1,
    description: task.description,
    options: [],
    resolution
  });
  delete tasks[String(taskId)];
}
