import { appendSection } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs),\s*relativeFilePath:\s*(.+),\s*content:\s*(.+)/s);
    if (!match) throw new Error('Invalid prompt format for append-section: expected "backlog: specs|docs, relativeFilePath: key, content: ..."');
    const backlogType = match[1];
    const relativeFilePath = match[2].trim();
    const initialContent = match[3].trim();
    await appendSection(backlogType, relativeFilePath, initialContent);
    return 'Section appended successfully';
}