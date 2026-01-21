import { findSectionByFileName } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { backlogType, filename } = context;
    if (!backlogType || !filename) {
        throw new Error('Invalid input for find-section-by-file-name: expected backlogType and filename.');
    }
    const fileKey = await findSectionByFileName(backlogType, String(filename).trim());
    return fileKey;
}
