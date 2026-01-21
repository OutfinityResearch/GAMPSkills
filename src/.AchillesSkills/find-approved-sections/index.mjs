import { findSectionsByStatus } from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { backlogType } = context;
    if (!backlogType) {
        throw new Error('Invalid input for find-approved-sections: expected backlogType.');
    }
    const approved = await findSectionsByStatus(backlogType, 'ok');
    return approved;
}
