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

export function normalizeIssue(raw) {
  let title = '';
  let details = '';
  let status = '';

  if (typeof raw === 'string') {
    title = raw;
  } else if (typeof raw === 'object') {
    title = raw.title || '';
    details = raw.details || '';
    status = raw.status || '';
  }

  return { id: 0, title, details, status }; // id will be set later
}

export function toMarkdown(issue) {
  let md = `${issue.id}. ${issue.title}`;
  if (issue.details) {
    md += `\n   ${issue.details}`;
  }
  return md;
}

export function fromMarkdown(line) {
  const match = line.match(/^(\d+)\.\s*(.+)$/);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  const title = match[2];
  // For details, assuming next lines, but for simplicity, assume title only here
  return { id, title, details: '', status: '' };
}

export function filterByStatus(sections, status) {
  const filtered = {};
  for (const [key, section] of Object.entries(sections)) {
    if (section.status === status) {
      filtered[key] = section;
    }
  }
  return filtered;
}

export function findByFile(sections, fileKey) {
  return sections[fileKey] || null;
}

export function listIssues(sections) {
  const issues = [];
  for (const section of Object.values(sections)) {
    issues.push(...section.issues);
  }
  return issues;
}

export class ChangeQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(sectionRef, change) {
    this.queue.push({ sectionRef, change });
  }

  drain() {
    // Sort by sectionRef for deterministic order
    this.queue.sort((a, b) => a.sectionRef.localeCompare(b.sectionRef));
    const changes = [...this.queue];
    this.queue = [];
    return changes;
  }

  clear() {
    this.queue = [];
  }
}