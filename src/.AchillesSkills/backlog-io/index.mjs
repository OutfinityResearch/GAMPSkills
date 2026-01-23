import * as BacklogManager from '../../BacklogManager/BacklogManager.mjs';
import { resolveArguments } from '../../ArgumentResolver.mjs';

export async function action(context) {
    const { llmAgent, recursiveAgent, ...args } = context;
    
    // If we have structured args already, use them directly
    if (args.operation && args.type) {
        return await executeBacklogOperation(args);
    }
    
    // Otherwise, resolve from natural language input
    const prompt = args.prompt || args.input || Object.values(args)[0];
    if (!prompt) {
        throw new Error('No input provided for backlog-io operation');
    }
    
    const schema = ['operation', 'type', 'fileKey', 'status', 'initialContent'];
    const regexPatterns = [
        /(\w+)\s+(specs|docs)\s*(.+)?/,  // "loadBacklog specs"
        /(\w+)\s+(specs|docs)\s+(\w+)/,  // "getTask docs myfile"
        /(\w+):\s*(\w+)/,                // "operation: loadBacklog"
    ];
    
    const resolvedArgs = await resolveArguments(
        llmAgent,
        prompt,
        'Extract backlog operation arguments',
        schema,
        regexPatterns
    );
    
    const [operation, type, fileKey, status, initialContent] = resolvedArgs;
    return await executeBacklogOperation({ 
        operation, type, fileKey, status, initialContent,
        // Pass through other optional args that might be in context
        ...args
    });
}

async function executeBacklogOperation({ operation, type, fileKey, issue, proposal, resolution, prefix, fileName, status, updates, initialContent }) {
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
