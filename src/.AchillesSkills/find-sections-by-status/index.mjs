import { findSectionsByStatus } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { backlogType, status } = context;
    if (!backlogType || !status) {
        throw new Error('Invalid input for find-sections-by-status: expected backlogType and status.');
    }
    const fileKeys = await findSectionsByStatus(backlogType, status);
    return fileKeys;
}
