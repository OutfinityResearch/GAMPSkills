import BacklogManager from '../BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs),\s*fileKey:\s*(.+),\s*content:\s*(.+)/s);
    if (!match) throw new Error('Invalid prompt format for append-section: expected "backlog: specs|docs, fileKey: key, content: ..."');
    const backlogType = match[1];
    const fileKey = match[2].trim();
    const initialContent = match[3].trim();
    const sections = BacklogManager.loadBacklog(backlogType === 'specs' ? BacklogManager.SPECS_BACKLOG : BacklogManager.DOCS_BACKLOG);
    if (!sections[fileKey]) {
        BacklogManager.appendSection(sections, fileKey, initialContent);
    }
    return sections;
}