import { readFile, writeFile, appendFile, unlink, mkdir, readdir, copyFile, rename } from 'fs/promises';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { extractArgumentsWithLLM, stripDependsOn } from '../../../../utils/ArgumentResolver.mjs';
import { parseKeyValueOptionsWithMultiline } from '../../../../utils/optionsParser.mjs';

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
    const sanitizedPrompt = stripDependsOn(rawPrompt);
    const tokens = sanitizedPrompt.split(/\s+/).filter(Boolean);

    let operation = tokens[0];
    let path = tokens[1];
    let content;
    let destination;
    let options;

    if (typeof operation === 'string') {
        operation = operation.trim().split(/\s+/)[0];
    }
    if (typeof path === 'string') {
        path = path.trim();
    }

    if (!allowedOperations.has(operation) || !path) {
        throw new Error('Invalid input: operation and path are required and must be valid.');
    }

    const optionsMatch = sanitizedPrompt.match(/\boptions\s*:\s*/i);
    if (optionsMatch && optionsMatch.index !== undefined) {
        const optionsRaw = sanitizedPrompt.slice(optionsMatch.index + optionsMatch[0].length).trim();
        if (optionsRaw) {
            try {
                options = parseKeyValueOptionsWithMultiline(optionsRaw, {
                    allowedKeys: new Set(['content', 'destination']),
                    multilineKeys: new Set(['content']),
                });
            } catch (error) {
                if (!llmAgent || typeof llmAgent.complete !== 'function') {
                    throw new Error('Invalid options: unable to parse.');
                }

                const llmResult = await extractArgumentsWithLLM(
                    llmAgent,
                    optionsRaw,
                    'Extract file system operation options as key-value pairs.',
                    ['content', 'destination'],
                );

                if (Array.isArray(llmResult)) {
                    [content, destination] = llmResult;
                } else {
                    throw new Error('Invalid options: unable to parse.');
                }
            }
        }
    }

    if (options !== undefined) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new Error('Invalid options: expected an object.');
        }
        if (Object.prototype.hasOwnProperty.call(options, 'content')) {
            content = options.content;
        }
        if (Object.prototype.hasOwnProperty.call(options, 'destination')) {
            destination = options.destination;
        }
    }

    const result = await executeFileOperation({ operation, path, content, destination });
    if (typeof result === 'string') {
        return result;
    }
    return JSON.stringify(result);
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
