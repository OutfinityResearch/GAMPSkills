import * as BacklogManager from '../../BacklogManager/BacklogManager.mjs';
import { extractArgumentsWithLLM } from '../../ArgumentResolver.mjs';

export async function action(context) {
    const { llmAgent, recursiveAgent, promptText } = context;
    
    const allowedOperations = new Set([
        'loadBacklog',
        'getTask',
        'recordIssue',
        'proposeFix',
        'approveResolution',
        'findTasksByPrefix',
        'findTaskByFileName',
        'findTasksByStatus',
        'setStatus',
        'updateTask',
        'appendTask',
    ]);

    const lines = String(promptText).split(/\r?\n/);
    const firstLineIndex = lines.findIndex((line) => line.trim().length > 0);
    const firstLine = firstLineIndex >= 0 ? lines[firstLineIndex].trim() : '';
    const tokens = firstLine.split(/\s+/).filter(Boolean);

    let operation = tokens[0];
    let type = tokens[1];
    let fileKey = tokens[2];
    let issue;
    let proposal;
    let resolution;
    let prefix;
    let fileName;
    let status;
    let updates;
    let initialContent;

    const remainingLines = firstLineIndex >= 0 ? lines.slice(firstLineIndex + 1) : [];
    const keyValuePattern = /^(\w+)\s*:\s*(.*)$/;
    for (let i = 0; i < remainingLines.length; i += 1) {
        const line = remainingLines[i];
        const match = line.match(keyValuePattern);
        if (!match) {
            continue;
        }
        const key = match[1];
        const value = match[2] ?? '';

        if (key === 'fileKey') {
            fileKey = value.trim();
        } else if (key === 'status') {
            status = value.trim();
        } else if (key === 'initialContent') {
            const tail = remainingLines.slice(i + 1).join('\n');
            initialContent = value + (tail ? `\n${tail}` : '');
            break;
        }
    }

    if (typeof operation === 'string') {
        operation = operation.trim().split(/\s+/)[0];
    }
    if (typeof type === 'string') {
        type = type.trim().toLowerCase();
    }

    if (!allowedOperations.has(operation) || (type && !['specs', 'docs'].includes(type))) {
        if (!llmAgent || typeof llmAgent.complete !== 'function') {
            throw new Error(`Unknown operation: ${operation}`);
        }

        const llmResult = await extractArgumentsWithLLM(
            llmAgent,
            promptText,
            `Extract backlog operation arguments. Allowed operations: ${Array.from(allowedOperations).join(', ')}`,
            ['operation', 'type', 'fileKey', 'status', 'initialContent'],
        );

        if (Array.isArray(llmResult)) {
            [operation, type, fileKey, status, initialContent] = llmResult;
            if (typeof operation === 'string') {
                operation = operation.trim().split(/\s+/)[0];
            }
            if (typeof type === 'string') {
                type = type.trim().toLowerCase();
            }
        } else {
            throw new Error(`Unknown operation: ${operation}`);
        }
    }

    return await executeBacklogOperation({
        operation, type, fileKey, issue, proposal, resolution, prefix, fileName, status, updates, initialContent
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
