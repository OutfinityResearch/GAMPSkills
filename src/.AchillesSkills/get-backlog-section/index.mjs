import { getSection } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs),\s*relativeFilePath:\s*(.+)/);
    if (!match) throw new Error('Invalid prompt format for get-backlog-section: expected "backlog: specs|docs, relativeFilePath: key"');
    const backlogType = match[1];
    const relativeFilePath = match[2].trim();
    const section = await getSection(backlogType, relativeFilePath);
    return section;
}