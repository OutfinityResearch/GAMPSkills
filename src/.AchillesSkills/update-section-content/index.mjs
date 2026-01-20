import BacklogManager from '../BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs),\s*fileKey:\s*(.+),\s*updates:\s*(.+)/s);
    if (!match) throw new Error('Invalid prompt format for update-section-content: expected "backlog: specs|docs, fileKey: key, updates: {...}"');
    const backlogType = match[1];
    const fileKey = match[2].trim();
    const updatesJson = match[3].trim();
    const updates = JSON.parse(updatesJson);
    const sections = BacklogManager.loadBacklog(backlogType === 'specs' ? BacklogManager.SPECS_BACKLOG : BacklogManager.DOCS_BACKLOG);
    BacklogManager.updateSection(sections, fileKey, updates);
    return sections;
}