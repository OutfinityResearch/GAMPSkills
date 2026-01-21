import { readFile } from 'node:fs/promises';

export async function action(context) {
    const { filePath } = context;
    if (!filePath) {
        throw new Error('Invalid input for read-file: expected filePath.');
    }
    const path = String(filePath).trim();
    const content = await readFile(path, 'utf8');
    return content;
}
