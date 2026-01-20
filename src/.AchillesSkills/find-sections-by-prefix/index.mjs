import { loadBacklog, findSectionsByPrefix } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs),\s*prefix:\s*(.+)/);
    if (!match) throw new Error('Invalid prompt format for find-sections-by-prefix: expected "backlog: specs|docs, prefix: string"');
    const backlogType = match[1];
    const prefix = match[2].trim();
    const { sections } = await loadBacklog(backlogType);
    const fileKeys = findSectionsByPrefix(sections, prefix);
    return fileKeys;
}