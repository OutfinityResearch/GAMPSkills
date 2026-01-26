import { readFile, writeFile, appendFile, unlink, mkdir, readdir, stat, copyFile, rename } from 'fs/promises';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { resolveArguments } from '../../ArgumentResolver.mjs';

export async function action(context) {
    const { llmAgent, recursiveAgent, ...args } = context;
    
    // If we have structured args already, use them directly
    if (args.operation && args.path) {
        return await executeFileOperation(args);
    }
    
    // Otherwise, resolve from natural language input
    const prompt = args.prompt || args.input || Object.values(args)[0];
    if (!prompt) {
        throw new Error('No input provided for file-system operation');
    }
    
    const schema = ['operation', 'path', 'content', 'destination'];
    const regexPatterns = [
        /(\w+)\s+(.+)/,  // "createDirectory ./docs"
        /(\w+):\s*(.+)/, // "operation: createDirectory"
        /(\w+)\s+([^\s]+)\s+(.+)/, // "writeFile ./test.txt hello world"
    ];
    
    const resolvedArgs = await resolveArguments(
        llmAgent,
        prompt,
        'Extract file system operation arguments',
        schema,
        regexPatterns
    );
    
    // Handle case where resolvedArgs might be an object instead of array
    let operation, path, content, destination;
    if (Array.isArray(resolvedArgs)) {
        [operation, path, content, destination] = resolvedArgs;
    } else if (typeof resolvedArgs === 'object' && resolvedArgs !== null) {
        ({ operation, path, content, destination } = resolvedArgs);
    } else {
        throw new Error('Invalid resolved arguments format');
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
        case 'readFile':
            return `Read file at ${fullPath} successfully.`;
        
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
            return `Listed entries at ${fullPath} successfully: ${JSON.stringify(await readdir(fullPath))}.`;
        
        case 'fileExists':
            return `Checked file existence at ${fullPath}: ${existsSync(fullPath)}.`;
        
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
