import * as BacklogManager from '../../BacklogManager/BacklogManager.mjs';
import { extractArgumentsWithLLM } from '../../ArgumentResolver.mjs';

export async function action(context) {
    const { llmAgent, recursiveAgent, promptText } = context;
    
    const allowedOperations = new Set([
        'loadBacklog',
        'getTask',
        'proposeFix',
        'approveResolution',
        'findTasksByStatus',
        'setStatus',
        'markDone',
        'addOptionsFromText',
        'updateTask',
        'appendTask',
    ]);

    const rawText = String(promptText ?? '');
    const trimmed = rawText.trim();
    const tokenMatch = trimmed.match(/^(\S+)(?:\s+(\S+))?(?:\s+([\s\S]*))?$/);

    let operation = tokenMatch?.[1];
    let type = tokenMatch?.[2];
    let proposal;
    let resolution;
    let status;
    let updates;
    let taskId;
    let initialContent;
    let doneText;
    let optionsText;

    const paramText = tokenMatch?.[3] ?? '';
    const params = parseKeyValueParams(paramText);
    if (params.taskId !== undefined) taskId = params.taskId;
    if (params.proposal !== undefined) proposal = params.proposal;
    if (params.resolution !== undefined) resolution = params.resolution;
    if (params.status !== undefined) status = params.status;
    if (params.updates !== undefined) updates = params.updates;
    if (params.initialContent !== undefined) initialContent = params.initialContent;
    if (params.doneText !== undefined) doneText = params.doneText;
    if (params.optionsText !== undefined) optionsText = params.optionsText;

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
            ['operation', 'type', 'taskId', 'status', 'initialContent', 'doneText', 'optionsText'],
        );

        if (Array.isArray(llmResult)) {
            [operation, type, taskId, status, initialContent, doneText, optionsText] = llmResult;
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
        operation, type, taskId, proposal, resolution, status, updates, initialContent, doneText, optionsText
    });
}

function parseKeyValueParams(text) {
    const result = {};
    if (!text || !text.trim()) {
        return result;
    }

    const keyPattern = /\b(taskId|proposal|resolution|status|updates|initialContent|doneText|optionsText)\s*:\s*/g;
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

        if (key === 'proposal' || key === 'updates') {
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

async function executeBacklogOperation({ operation, type, taskId, proposal, resolution, status, updates, initialContent, doneText, optionsText }) {
    if (!operation) {
        throw new Error('Invalid input: operation is required.');
    }

    switch (operation) {
        case 'loadBacklog':
            return await BacklogManager.loadBacklog(type);
        
        case 'getTask':
            return await BacklogManager.getTask(type, taskId);
        
        case 'proposeFix':
            return await BacklogManager.proposeFix(type, taskId, proposal);
        
        case 'approveResolution':
            return await BacklogManager.approveResolution(type, taskId, resolution);
        
        case 'findTasksByStatus':
            return await BacklogManager.findTasksByStatus(type, status);
        
        case 'setStatus':
            await BacklogManager.setStatus(type, taskId, status);
            return 'Status updated successfully';

        case 'markDone':
            await BacklogManager.markDone(type, taskId, doneText);
            return 'Task moved to history successfully';

        case 'addOptionsFromText':
            await BacklogManager.addOptionsFromText(type, taskId, optionsText);
            return 'Options added successfully';
        
        case 'updateTask':
            await BacklogManager.updateTask(type, taskId, updates);
            return 'Task updated successfully';
        
        case 'appendTask':
            await BacklogManager.appendTask(type, initialContent);
            return 'Task appended successfully';
        
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}