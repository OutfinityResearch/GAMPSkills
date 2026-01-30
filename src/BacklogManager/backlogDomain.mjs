export const STATUS = {
  ok: 'ok',
  needs_work: 'needs_work',
  blocked: 'blocked'
};

export function assertValidStatus(status) {
  if (!Object.values(STATUS).includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
}

export function nextAllowed(current, next) {
  assertValidStatus(current);
  if (next) {
    assertValidStatus(next);
  }

  const transitions = {
    [STATUS.ok]: [STATUS.needs_work],
    [STATUS.needs_work]: [STATUS.ok, STATUS.blocked],
    [STATUS.blocked]: [STATUS.ok, STATUS.needs_work]
  };

  if (next && !transitions[current].includes(next)) {
    throw new Error(`Invalid transition from ${current} to ${next}`);
  }

  return next || transitions[current][0]; // default to first allowed
}

export function filterByStatus(tasks, status) {
  const filtered = {};
  for (const [key, task] of Object.entries(tasks)) {
    if (task.status === status) {
      filtered[key] = task;
    }
  }
  return filtered;
}

export class ChangeQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(taskRef, change) {
    this.queue.push({ taskRef, change });
  }

  drain() {
    // Sort by taskRef for deterministic order
    this.queue.sort((a, b) => a.taskRef.localeCompare(b.taskRef));
    const changes = [...this.queue];
    this.queue = [];
    return changes;
  }

  clear() {
    this.queue = [];
  }
}
