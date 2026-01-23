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
    
    const [operation, path, content, destination] = resolvedArgs;
    return await executeFileOperation({ operation, path, content, destination });
}

async function executeFileOperation({ operation, path, content, destination }) {
    if (!operation || !path) {
        throw new Error('Invalid input: operation and path are required.');
    }

    const fullPath = resolve(path);

    switch (operation) {
        case 'readFile':
            return await readFile(fullPath, 'utf8');
        
        case 'writeFile':
            await mkdir(dirname(fullPath), { recursive: true });
            await writeFile(fullPath, content || '', 'utf8');
            return 'File written successfully';
        
        case 'appendFile':
            await appendFile(fullPath, content || '', 'utf8');
            return 'Content appended successfully';
        
        case 'deleteFile':
            await unlink(fullPath);
            return 'File deleted successfully';
        
        case 'createDirectory':
            await mkdir(fullPath, { recursive: true });
            return 'Directory created successfully';
        
        case 'listDirectory':
            return await readdir(fullPath);
        
        case 'fileExists':
            return { exists: existsSync(fullPath) };
        
        case 'copyFile':
            if (!destination) throw new Error('Destination required for copyFile');
            await copyFile(fullPath, resolve(destination));
            return 'File copied successfully';
        
        case 'moveFile':
            if (!destination) throw new Error('Destination required for moveFile');
            await rename(fullPath, resolve(destination));
            return 'File moved successfully';
        
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }
}
