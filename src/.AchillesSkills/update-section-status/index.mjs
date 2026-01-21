import { setStatus } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { backlogType, fileKey, status } = context;
    if (!backlogType || !fileKey || !status) {
        throw new Error('Invalid input for update-section-status: expected backlogType, fileKey, and status.');
    }
    const relativeFilePath = String(fileKey).trim();
    await setStatus(backlogType, relativeFilePath, status);
    return 'Section status updated and saved successfully';
}
