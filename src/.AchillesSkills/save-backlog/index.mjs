import BacklogManager from '../BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs),\s*sections:\s*(.+)/s);
    if (!match) throw new Error('Invalid prompt format for save-backlog: expected "backlog: specs|docs, sections: {...}"');
    const backlogType = match[1];
    const sectionsJson = match[2].trim();
    const sections = JSON.parse(sectionsJson);
    BacklogManager.saveBacklog(backlogType === 'specs' ? BacklogManager.SPECS_BACKLOG : BacklogManager.DOCS_BACKLOG, sections);
    return 'Backlog saved successfully';
}