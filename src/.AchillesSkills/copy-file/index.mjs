import { copyFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/source:\s*(.+),\s*dest:\s*(.+)/);
    if (!match) throw new Error('Invalid prompt format for copy-file: expected "source: /path/src, dest: /path/dest"');
    const source = match[1].trim();
    const dest = match[2].trim();
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(source, dest);
    return 'File copied successfully';
}