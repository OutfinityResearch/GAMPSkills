import BacklogManager from '../BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs),\s*fileKey:\s*(.+),\s*status:\s*(.+)/);
    if (!match) throw new Error('Invalid prompt format for update-section-status: expected "backlog: specs|docs, fileKey: key, status: ok|needs_work|blocked"');
    const backlogType = match[1];
    const fileKey = match[2].trim();
    const status = match[3].trim();
    const sections = BacklogManager.loadBacklog(backlogType === 'specs' ? BacklogManager.SPECS_BACKLOG : BacklogManager.DOCS_BACKLOG);
    BacklogManager.setStatus(sections, fileKey, status);
    return sections;
}