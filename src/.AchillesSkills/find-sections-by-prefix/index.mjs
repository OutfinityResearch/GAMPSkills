import { findSectionsByPrefix } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { backlogType, prefix } = context;
    if (!backlogType || !prefix) {
        throw new Error('Invalid input for find-sections-by-prefix: expected backlogType and prefix.');
    }
    const fileKeys = await findSectionsByPrefix(backlogType, prefix);
    return fileKeys;
}
