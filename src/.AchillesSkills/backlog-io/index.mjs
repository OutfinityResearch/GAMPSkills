import * as BacklogManager from '../../BacklogManager.mjs';
import { extractArgumentsWithLLM } from '../../ArgumentResolver.mjs';

export async function action(context) {
    const { llmAgent, recursiveAgent, promptText } = context;
    
    const allowedOperations = new Set([
        'createBacklog',
        'loadBacklog',
        'getTask',
        'approveTask',
        'getApprovedTasks',
        'getNewTasks',
        'markDone',
        'addOptionsFromText',
        'addTasksFromText',
        'updateTask',
        'addTask',
    ]);

    const rawText = String(promptText ?? '');
    const trimmed = rawText.trim();
    const tokenMatch = trimmed.match(/^(\S+)(?:\s+(\S+))?(?:\s+([\s\S]*))?$/);

    let operation = tokenMatch?.[1];
    let type = tokenMatch?.[2];
    let resolution;
    let updates;
    let taskId;
    let initialContent;
    let optionsText;
    let tasksText;

    const paramText = tokenMatch?.[3] ?? '';
    const params = parseKeyValueParams(paramText);
    if (params.taskId !== undefined) taskId = params.taskId;
    if (params.resolution !== undefined) resolution = params.resolution;
    if (params.updates !== undefined) updates = params.updates;
    if (params.initialContent !== undefined) initialContent = params.initialContent;
    if (params.optionsText !== undefined) optionsText = params.optionsText;
    if (params.tasksText !== undefined) tasksText = params.tasksText;

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
            ['operation', 'type', 'taskId', 'resolution', 'initialContent', 'optionsText', 'tasksText'],
        );

        if (Array.isArray(llmResult)) {
            [operation, type, taskId, resolution, initialContent, optionsText, tasksText] = llmResult;
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
        operation, type, taskId, resolution, updates, initialContent, optionsText, tasksText
    });
}

function parseKeyValueParams(text) {
    const result = {};
    if (!text || !text.trim()) {
        return result;
    }

    const keyPattern = /\b(taskId|resolution|updates|initialContent|optionsText|tasksText|dependsOn)\s*:\s*/g;
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

        if (key === 'updates') {
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

async function executeBacklogOperation({ operation, type, taskId, resolution, updates, initialContent, optionsText, tasksText }) {
    if (!operation) {
        throw new Error('Invalid input: operation is required.');
    }

    switch (operation) {
        case 'createBacklog':
            return await BacklogManager.createBacklog(type);

        case 'loadBacklog':
            return await BacklogManager.loadBacklog(type);
        
        case 'getTask':
            return await BacklogManager.getTask(type, taskId);
        
        case 'approveTask':
            return await BacklogManager.approveTask(type, taskId, resolution);
        
        case 'getApprovedTasks':
            return await BacklogManager.getApprovedTasks(type);
        
        case 'getNewTasks':
            return await BacklogManager.getNewTasks(type);
        
        case 'markDone':
            return await BacklogManager.markDone(type, taskId);

        case 'addOptionsFromText':
            await BacklogManager.addOptionsFromText(type, taskId, optionsText);
            return "";

        case 'addTasksFromText':
            return await BacklogManager.addTasksFromText(type, tasksText);

        case 'updateTask':
            return await BacklogManager.updateTask(type, taskId, updates);

        case 'addTask':
            return await BacklogManager.addTask(type, initialContent);
        
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}
