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

    const rawText = String(promptText ?? '');
    const trimmed = rawText.trim();
    const tokenMatch = trimmed.match(/^(\S+)(?:\s+(\S+))?(?:\s+([\s\S]*))?$/);

    let operation = tokenMatch?.[1];
    let type = tokenMatch?.[2];
    let issue;
    let proposal;
    let resolution;
    let prefix;
    let fileName;
    let status;
    let updates;
    let fileKey;
    let initialContent;

    const paramText = tokenMatch?.[3] ?? '';
    const params = parseKeyValueParams(paramText);
    if (params.fileKey !== undefined) fileKey = params.fileKey;
    if (params.issue !== undefined) issue = params.issue;
    if (params.proposal !== undefined) proposal = params.proposal;
    if (params.resolution !== undefined) resolution = params.resolution;
    if (params.prefix !== undefined) prefix = params.prefix;
    if (params.fileName !== undefined) fileName = params.fileName;
    if (params.status !== undefined) status = params.status;
    if (params.updates !== undefined) updates = params.updates;
    if (params.initialContent !== undefined) initialContent = params.initialContent;

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

function parseKeyValueParams(text) {
    const result = {};
    if (!text || !text.trim()) {
        return result;
    }

    const keyPattern = /\b(fileKey|issue|proposal|resolution|prefix|fileName|status|updates|initialContent)\s*:\s*/g;
    const matches = Array.from(text.matchAll(keyPattern));
    if (matches.length === 0) {
        return result;
    }

    for (let i = 0; i < matches.length; i += 1) {
        const match = matches[i];
        const key = match[1];
        const valueStart = match.index + match[0].length;
        const nextMatch = matches[i + 1];
        const valueEnd = nextMatch ? nextMatch.index : text.length;
        const rawValue = text.slice(valueStart, valueEnd).trim();

        if (!rawValue) {
            result[key] = '';
            continue;
        }

        if (key === 'issue' || key === 'proposal' || key === 'updates') {
            result[key] = parseMaybeJson(rawValue);
        } else {
            result[key] = rawValue;
        }
    }

    return result;
}

function parseMaybeJson(value) {
    const trimmed = value.trim();
    if (!trimmed) {
        return trimmed;
    }
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            return JSON.parse(trimmed);
        } catch (error) {
            return value;
        }
    }
    return value;
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
