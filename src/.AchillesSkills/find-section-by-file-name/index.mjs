import BacklogManager from '../BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs),\s*filename:\s*(.+)/);
    if (!match) throw new Error('Invalid prompt format for find-section-by-file-name: expected "backlog: specs|docs, filename: name"');
    const backlogType = match[1];
    const filename = match[2].trim();
    const sections = BacklogManager.loadBacklog(backlogType === 'specs' ? BacklogManager.SPECS_BACKLOG : BacklogManager.DOCS_BACKLOG);
    const fileKey = BacklogManager.findSectionByFileName(sections, filename);
    return fileKey;
}