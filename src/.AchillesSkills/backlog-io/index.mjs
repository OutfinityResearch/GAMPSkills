import * as BacklogManager from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { operation, type, fileKey, issue, proposal, resolution, prefix, fileName, status, updates, initialContent } = context;
    
    if (!operation) {
        throw new Error('Invalid input: operation is required.');
    }

    switch (operation) {
        case 'loadBacklog':
            return await BacklogManager.loadBacklog(type);
        
        case 'getSection':
            return await BacklogManager.getSection(type, fileKey);
        
        case 'recordIssue':
            return await BacklogManager.recordIssue(type, fileKey, issue);
        
        case 'proposeFix':
            return await BacklogManager.proposeFix(type, fileKey, proposal);
        
        case 'approveResolution':
            return await BacklogManager.approveResolution(type, fileKey, resolution);
        
        case 'findSectionsByPrefix':
            return await BacklogManager.findSectionsByPrefix(type, prefix);
        
        case 'findSectionByFileName':
            return await BacklogManager.findSectionByFileName(type, fileName);
        
        case 'findSectionsByStatus':
            return await BacklogManager.findSectionsByStatus(type, status);
        
        case 'setStatus':
            await BacklogManager.setStatus(type, fileKey, status);
            return 'Status updated successfully';
        
        case 'updateSection':
            await BacklogManager.updateSection(type, fileKey, updates);
            return 'Section updated successfully';
        
        case 'appendSection':
            await BacklogManager.appendSection(type, fileKey, initialContent);
            return 'Section appended successfully';
        
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}
