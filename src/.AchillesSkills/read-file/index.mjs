import { readFile } from 'node:fs/promises';

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/path:\s*(.+)/);
    if (!match) throw new Error('Invalid prompt format for read-file: expected "path: /absolute/path"');
    const path = match[1].trim();
    const content = await readFile(path, 'utf8');
    return content;
}