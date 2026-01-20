import { setStatus } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/backlog:\s*(specs|docs),\s*relativeFilePath:\s*(.+),\s*status:\s*(.+)/);
    if (!match) throw new Error('Invalid prompt format for update-section-status: expected "backlog: specs|docs, relativeFilePath: key, status: ok|needs_work|blocked"');
    const backlogType = match[1];
    const relativeFilePath = match[2].trim();
    const status = match[3].trim();
    await setStatus(backlogType, relativeFilePath, status);
    return 'Section status updated and saved successfully';
}