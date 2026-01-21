import { updateSection } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { backlogType, fileKey, updates } = context;
    if (!backlogType || !fileKey || !updates) {
        throw new Error('Invalid input for update-section-content: expected backlogType, fileKey, and updates.');
    }
    const relativeFilePath = String(fileKey).trim();
    await updateSection(backlogType, relativeFilePath, updates);
    return 'Section updated successfully';
}
