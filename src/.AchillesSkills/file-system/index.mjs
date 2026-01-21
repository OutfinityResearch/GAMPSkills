import { readFile, writeFile, appendFile, unlink, mkdir, readdir, stat, copyFile, rename } from 'fs/promises';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';

export async function action(context) {
    const { operation, path, content, destination } = context;
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
