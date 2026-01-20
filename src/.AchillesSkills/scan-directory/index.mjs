import { readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { glob } from 'glob'; // Assuming glob is available, else fallback to fs

export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/root:\s*(.+),\s*include:\s*(.*),\s*exclude:\s*(.*),\s*recursive:\s*(true|false)/);
    if (!match) throw new Error('Invalid prompt format for scan-directory: expected "root: /path, include: pattern, exclude: pattern, recursive: true/false"');
    const root = match[1].trim();
    const include = match[2].trim() || '**/*';
    const exclude = match[3].trim();
    const recursive = match[4] === 'true';
    const options = { cwd: root, absolute: false };
    if (exclude) options.ignore = exclude;
    const files = await glob(include, options);
    return files;
}