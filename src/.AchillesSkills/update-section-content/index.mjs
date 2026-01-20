import { updateSection } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs),\s*relativeFilePath:\s*(.+),\s*updates:\s*(.+)/s);
    if (!match) throw new Error('Invalid prompt format for update-section-content: expected "backlog: specs|docs, relativeFilePath: key, updates: {...}"');
    const backlogType = match[1];
    const relativeFilePath = match[2].trim();
    const updatesJson = match[3].trim();
    const updates = JSON.parse(updatesJson);
    await updateSection(backlogType, relativeFilePath, updates);
    return 'Section updated successfully';
}