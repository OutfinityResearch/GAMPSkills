import BacklogManager from '../BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs),\s*fileKey:\s*(.+)/);
    if (!match) throw new Error('Invalid prompt format for get-backlog-section: expected "backlog: specs|docs, fileKey: key"');
    const backlogType = match[1];
    const fileKey = match[2].trim();
    const sections = BacklogManager.loadBacklog(backlogType === 'specs' ? BacklogManager.SPECS_BACKLOG : BacklogManager.DOCS_BACKLOG);
    const section = sections[fileKey] || null;
    return section;
}