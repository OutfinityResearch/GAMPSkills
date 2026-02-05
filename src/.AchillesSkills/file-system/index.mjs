import { readFile, writeFile, appendFile, unlink, mkdir, readdir, copyFile, rename } from 'fs/promises';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { extractArgumentsWithLLM } from '../../ArgumentResolver.mjs';

export async function action(context) {
    const { llmAgent, promptText } = context;

    // Otherwise, resolve from natural language input
    if (!promptText) {
        throw new Error('No input provided for file-system operation');
    }
    
    const allowedOperations = new Set([
        'readFile',
        'writeFile',
        'appendFile',
        'deleteFile',
        'createDirectory',
        'listDirectory',
        'fileExists',
        'copyFile',
        'moveFile',
    ]);

    const rawPrompt = String(promptText ?? '');
    const firstLine = rawPrompt.split(/\r?\n/, 1)[0].trim();
    const tokens = firstLine.split(/\s+/).filter(Boolean);

    let operation = tokens[0];
    let path = tokens[1];
    let content;
    let destination;

    const pathIndex = typeof path === 'string' ? rawPrompt.indexOf(path) : -1;
    const payload = pathIndex >= 0 ? rawPrompt.slice(pathIndex + path.length).trim() : '';

    if (/^destination\s*:/i.test(payload)) {
        destination = payload.replace(/^destination\s*:\s*/i, '');
    } else if (/^content\s*:/i.test(payload)) {
        content = payload.replace(/^content\s*:\s*/i, '');
    } else if (operation === 'writeFile' || operation === 'appendFile') {
        content = payload;
    }

    if (typeof operation === 'string') {
        operation = operation.trim().split(/\s+/)[0];
    }
    if (typeof path === 'string') {
        path = path.trim();
    }

    if (!allowedOperations.has(operation) || !path) {
        if (!llmAgent || typeof llmAgent.complete !== 'function') {
            throw new Error(`Unknown operation: ${operation}`);
        }

        const llmResult = await extractArgumentsWithLLM(
            llmAgent,
            promptText,
            `Extract file system operation arguments. Allowed operations: ${Array.from(allowedOperations).join(', ')}`,
            ['operation', 'path', 'content', 'destination'],
        );

        if (Array.isArray(llmResult)) {
            [operation, path, content, destination] = llmResult;
            if (typeof operation === 'string') {
                operation = operation.trim().split(/\s+/)[0];
            }
        } else {
            throw new Error(`Unknown operation: ${operation}`);
        }
    }

    return await executeFileOperation({ operation, path, content, destination });
}

async function executeFileOperation({ operation, path, content, destination }) {
    if (!operation || !path) {
        console.error('[file-system] Invalid input:', { operation: typeof operation, path: typeof path, operationValue: operation, pathValue: path });
        throw new Error('Invalid input: operation and path are required.');
    }

    const fullPath = resolve(path);

    switch (operation) {
        case 'readFile': {
            const fileContent = await readFile(fullPath, 'utf8');
            return `FILE_CONTENT:\n${fileContent}`;
        }

        case 'writeFile':
            await mkdir(dirname(fullPath), { recursive: true });
            await writeFile(fullPath, content || '', 'utf8');
            return `Wrote file at ${fullPath} successfully.`;
        
        case 'appendFile':
            await appendFile(fullPath, content || '', 'utf8');
            return `Appended content at ${fullPath} successfully.`;
        
        case 'deleteFile':
            await unlink(fullPath);
            return `Deleted file at ${fullPath} successfully.`;
        
        case 'createDirectory':
            await mkdir(fullPath, { recursive: true });
            return `Created directory at ${fullPath} successfully.`;
        
        case 'listDirectory':
            const entries = await readdir(fullPath);
            return `Listed entries at ${fullPath} successfully: ${JSON.stringify(entries)}.`;
        
        case 'fileExists':
            const exists = existsSync(fullPath);
            return `Checked file existence at ${fullPath}: ${exists}.`;
        
        case 'copyFile':
            if (!destination) throw new Error('Destination required for copyFile');
            const copyDestination = resolve(destination);
            await copyFile(fullPath, copyDestination);
            return `Copied file from ${fullPath} to ${copyDestination} successfully.`;
        
        case 'moveFile':
            if (!destination) throw new Error('Destination required for moveFile');
            const moveDestination = resolve(destination);
            await rename(fullPath, moveDestination);
            return `Moved file from ${fullPath} to ${moveDestination} successfully.`;
        
        default:
            console.error('[file-system] Unknown operation:', { operation: typeof operation, operationValue: operation });
            throw new Error(`Unknown operation: ${operation}`);
    }
}
