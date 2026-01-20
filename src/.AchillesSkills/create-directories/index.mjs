import { mkdir } from 'node:fs/promises';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/paths:\s*(.+)/);
    if (!match) throw new Error('Invalid prompt format for create-directories: expected "paths: /path1, /path2, ..."');
    const paths = match[1].split(',').map(p => p.trim()).filter(p => p);
    for (const path of paths) {
        await mkdir(path, { recursive: true });
    }
    return 'Directories created successfully';
}