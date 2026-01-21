import { copyFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function action(context) {
    const { sourcePath, destinationPath } = context;
    if (!sourcePath || !destinationPath) {
        throw new Error('Invalid input for copy-file: expected sourcePath and destinationPath.');
    }
    const source = String(sourcePath).trim();
    const dest = String(destinationPath).trim();
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(source, dest);
    return 'File copied successfully';
}
