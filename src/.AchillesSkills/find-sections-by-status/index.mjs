import BacklogManager from '../BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs),\s*status:\s*(.+)/);
    if (!match) throw new Error('Invalid prompt format for find-sections-by-status: expected "backlog: specs|docs, status: ok|needs_work|blocked"');
    const backlogType = match[1];
    const status = match[2].trim();
    const sections = BacklogManager.loadBacklog(backlogType === 'specs' ? BacklogManager.SPECS_BACKLOG : BacklogManager.DOCS_BACKLOG);
    const fileKeys = BacklogManager.findSectionsByStatus(sections, status);
    return fileKeys;
}