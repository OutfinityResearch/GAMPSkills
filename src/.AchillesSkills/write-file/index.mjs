import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function action(context) {
    const { filePath, content } = context;
    if (!filePath) {
        throw new Error('Invalid input for write-file: expected filePath.');
    }
    const path = String(filePath).trim();
    const contentText = content == null ? '' : String(content);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, contentText, 'utf8');
    return 'File written successfully';
}
