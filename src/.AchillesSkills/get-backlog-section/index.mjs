import { getSection } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { backlogType, fileKey } = context;
    if (!backlogType || !fileKey) {
        throw new Error('Invalid input for get-backlog-section: expected backlogType and fileKey.');
    }
    const relativeFilePath = String(fileKey).trim();
    const section = await getSection(backlogType, relativeFilePath);
    return section;
}
