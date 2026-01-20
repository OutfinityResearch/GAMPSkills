import { readFile, stat } from 'fs/promises';
import { resolve } from 'path';
import { parse, render, readBacklog, writeBacklog } from './backlogIO.mjs';
import { normalizeIssue, ChangeQueue, nextAllowed } from './backlogDomain.mjs';

export class BacklogManager {
  constructor() {
    this.specsSections = {};
    this.docsSections = {};
    this.currentType = null;
    this.meta = {};
  }

  async loadBacklog(type) {
    if (!['specs', 'docs'].includes(type)) {
      throw new Error(`Invalid type: ${type}`);
    }
    const path = resolve(`./${type}_backlog.md`);
    const rawContent = await readBacklog(path);
    const sections = parse(rawContent);
    const stats = await stat(path);
    this.meta[type] = { mtime: stats.mtime, size: stats.size };
    if (type === 'specs') {
      this.specsSections = sections;
    } else {
      this.docsSections = sections;
    }
    this.currentType = type;
    return { sections, meta: this.meta[type] };
  }

  getSection(fileKey) {
    const sections = this.currentType === 'specs' ? this.specsSections : this.docsSections;
    return sections[fileKey] || null;
  }

  recordIssue(sectionRef, issue) {
    const section = typeof sectionRef === 'string' ? this.getSection(sectionRef) : sectionRef;
    if (!section) return null;
    const normalized = normalizeIssue(issue);
    normalized.id = section.issues.length + 1;
    section.issues.push(normalized);
    return section;
  }

  proposeFix(sectionRef, proposal) {
    const section = typeof sectionRef === 'string' ? this.getSection(sectionRef) : sectionRef;
    if (!section) return null;
    const normalized = normalizeIssue(proposal); // reuse
    normalized.id = section.options.length + 1;
    section.options.push(normalized);
    return section;
  }

  approveResolution(sectionRef, resolutionString) {
    const section = typeof sectionRef === 'string' ? this.getSection(sectionRef) : sectionRef;
    if (!section) return null;
    section.resolution = resolutionString;
    // Update status if resolution is set
    if (resolutionString.trim()) {
      section.status = 'ok';
    }
    return section;
  }

  applyChanges(sectionRef, approvedItems, hooks) {
    const section = typeof sectionRef === 'string' ? this.getSection(sectionRef) : sectionRef;
    if (!section) return null;
    const queue = new ChangeQueue();
    for (const item of approvedItems) {
      queue.enqueue(sectionRef, item);
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
    return changes;
  }

  async saveBacklog(type, sections) {
    const path = resolve(`./${type}_backlog.md`);
    const content = render(sections);
    await writeBacklog(path, content);
  }

  findSectionsByPrefix(type, prefix) {
    const sections = type === 'specs' ? this.specsSections : this.docsSections;
    const names = [];
    for (const key of Object.keys(sections)) {
      if (key.startsWith(prefix)) {
        names.push(key);
      }
    }
    return names;
  }

  findSectionByFileName(type, fileName) {
    const sections = type === 'specs' ? this.specsSections : this.docsSections;
    for (const [key, section] of Object.entries(sections)) {
      if (key.endsWith(fileName)) {
        return key;
      }
    }
    return null;
  }

  findSectionsByStatus(type, status) {
    const sections = type === 'specs' ? this.specsSections : this.docsSections;
    const names = [];
    for (const [key, section] of Object.entries(sections)) {
      if (section.status === status) {
        names.push(key);
      }
    }
    return names;
  }
}