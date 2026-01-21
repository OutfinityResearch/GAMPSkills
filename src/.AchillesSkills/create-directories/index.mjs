import { mkdir } from 'node:fs/promises';

export async function action(context) {
    const { paths } = context;
    if (!Array.isArray(paths)) {
        throw new Error('Invalid input for create-directories: expected paths array.');
    }
    for (const path of paths) {
        if (path) {
            await mkdir(path, { recursive: true });
        }
    }
    return 'Directories created successfully';
}
