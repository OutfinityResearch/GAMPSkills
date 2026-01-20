import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/path:\s*(.+),\s*content:\s*(.+)/s);
    if (!match) throw new Error('Invalid prompt format for write-file: expected "path: /absolute/path, content: ..."');
    const path = match[1].trim();
    const content = match[2].trim();
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, 'utf8');
    return 'File written successfully';
}