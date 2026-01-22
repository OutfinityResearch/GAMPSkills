import * as BacklogManager from '../../BacklogManager/BacklogManager.mjs';

export async function action(context) {
    const { operation, type, fileKey, issue, proposal, resolution, prefix, fileName, status, updates, initialContent } = context;
    
    if (!operation) {
        throw new Error('Invalid input: operation is required.');
    }

    switch (operation) {
        case 'loadBacklog':
            return await BacklogManager.loadBacklog(type);
        
        case 'getTask':
            return await BacklogManager.getTask(type, fileKey);
        
        case 'recordIssue':
            return await BacklogManager.recordIssue(type, fileKey, issue);
        
        case 'proposeFix':
            return await BacklogManager.proposeFix(type, fileKey, proposal);
        
        case 'approveResolution':
            return await BacklogManager.approveResolution(type, fileKey, resolution);
        
        case 'findTasksByPrefix':
            return await BacklogManager.findTasksByPrefix(type, prefix);
        
        case 'findTaskByFileName':
            return await BacklogManager.findTaskByFileName(type, fileName);
        
        case 'findTasksByStatus':
            return await BacklogManager.findTasksByStatus(type, status);
        
        case 'setStatus':
            await BacklogManager.setStatus(type, fileKey, status);
            return 'Status updated successfully';
        
        case 'updateTask':
            await BacklogManager.updateTask(type, fileKey, updates);
            return 'Task updated successfully';
        
        case 'appendTask':
            await BacklogManager.appendTask(type, fileKey, initialContent);
            return 'Task appended successfully';
        
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}
