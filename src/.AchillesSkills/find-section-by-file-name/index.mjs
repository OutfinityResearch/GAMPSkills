import { loadBacklog, findSectionByFileName } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs),\s*filename:\s*(.+)/);
    if (!match) throw new Error('Invalid prompt format for find-section-by-file-name: expected "backlog: specs|docs, filename: name"');
    const backlogType = match[1];
    const filename = match[2].trim();
    const { sections } = await loadBacklog(backlogType);
    const fileKey = findSectionByFileName(sections, filename);
    return fileKey;
}