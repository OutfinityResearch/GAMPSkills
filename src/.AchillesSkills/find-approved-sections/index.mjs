import BacklogManager from '../BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs)/);
    if (!match) throw new Error('Invalid prompt format for find-approved-sections: expected "backlog: specs|docs"');
    const backlogType = match[1];
    const sections = BacklogManager.loadBacklog(backlogType === 'specs' ? BacklogManager.SPECS_BACKLOG : BacklogManager.DOCS_BACKLOG);
    const approved = BacklogManager.findApprovedItems(sections);
    return approved;
}