import { appendSection } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { backlogType, fileKey, section } = context;
    if (!backlogType || !fileKey) {
        throw new Error('Invalid input for append-section: expected backlogType and fileKey.');
    }
    const initialContent = typeof section === 'string'
        ? section
        : (section?.description ? String(section.description) : '');
    const relativeFilePath = String(fileKey).trim();
    await appendSection(backlogType, relativeFilePath, initialContent);
    return 'Section appended successfully';
}
