import { readFile, stat } from 'fs/promises';
import { randomUUID } from 'crypto';
import { resolve, relative, basename, extname } from 'path';
import { buildMatcher } from './listing.mjs';

/**
 * Reads requested files into the readFiles Map, respecting options.
 * @param {string[]} filePaths - files to read (relative to options.dir or cwd)
 * @param {Map<string, string>} readFiles - accumulated map of path → content
 * @param {object} options - { dir, maxFiles, maxFileSize, filter }
 */
export async function readRequestedFiles(filePaths, readFiles, options) {
    const { maxFiles = null, maxFileSize = null, filter = null, dir = '.' } = options;
    const filterMatcher = filter ? buildMatcher(filter) : null;

    for (const filePath of filePaths) {
        // Enforce maxFiles cap
        if (maxFiles !== null && readFiles.size >= maxFiles) break;

        if (readFiles.has(filePath)) continue;

        // Enforce filter: skip files that don't match the filter
        if (filterMatcher) {
            const fileName = filePath.split('/').pop();
            if (!filterMatcher(fileName)) continue;
        }

        try {
            const fullPath = resolve(filePath);

            // Enforce maxFileSize
            if (maxFileSize !== null) {
                const fileStat = await stat(fullPath);
                if (fileStat.size > maxFileSize) {
                    readFiles.set(filePath, `[Skipped: file size ${fileStat.size} bytes exceeds maxFileSize ${maxFileSize}]`);
                    continue;
                }
            }

            const content = await readFile(fullPath, 'utf8');
            readFiles.set(filePath, content);
        } catch (err) {
            readFiles.set(filePath, `[Error reading file: ${err.message}]`);
        }
    }
}

/**
 * Force-reads include files into the readFiles Map.
 * These bypass the filter but still respect maxFileSize.
 * @param {string[]|null} includePaths - files to force-include
 * @param {Map<string, string>} readFiles - accumulated map
 * @param {object} options - { maxFileSize }
 */
export async function readIncludeFiles(includePaths, readFiles, options) {
    if (!includePaths || !Array.isArray(includePaths)) return;

    const { maxFileSize = null } = options;

    for (const filePath of includePaths) {
        if (readFiles.has(filePath)) continue;

        try {
            const fullPath = resolve(filePath);

            if (maxFileSize !== null) {
                const fileStat = await stat(fullPath);
                if (fileStat.size > maxFileSize) {
                    readFiles.set(filePath, `[Skipped: file size ${fileStat.size} bytes exceeds maxFileSize ${maxFileSize}]`);
                    continue;
                }
            }

            const content = await readFile(fullPath, 'utf8');
            readFiles.set(filePath, content);
        } catch (err) {
            readFiles.set(filePath, `[Error reading file: ${err.message}]`);
        }
    }
}

/**
 * Builds SOPLang assign lines from accumulated read files.
 * Paths in output are relative to process.cwd().
 * @param {Map<string, string>} readFiles - map of path → content
 * @returns {string}
 */
function buildSafeBaseName(filePath, prefix = 'spec_') {
    const fileName = basename(filePath);
    const ext = extname(fileName);
    const withoutExt = ext ? fileName.slice(0, -ext.length) : fileName;
    const normalized = withoutExt
        .replace(/[^A-Za-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    const base = normalized || 'file';
    const safe = /^[A-Za-z]/.test(base) ? base : `F_${base}`;
    return `${prefix}${safe}`;
}

function buildHereDocToken(content, base = 'context') {
    const raw = typeof content === 'string' ? content : '';
    let token = base;
    let counter = 0;
    while (raw.includes(`--begin-${token}--`) || raw.includes(`--end-${token}--`)) {
        counter += 1;
        token = `${base}-${counter}`;
    }
    return token;
}

export function buildContextAssignString(readFiles) {
    if (readFiles.size === 0) return '';

    const cwd = process.cwd();
    const lines = [];

    for (const [filePath, content] of readFiles) {
        const relPath = relative(cwd, resolve(filePath)).replace(/\\/g, '/');
        const baseName = buildSafeBaseName(relPath);
        const token = buildHereDocToken(content, `context-${randomUUID()}`);
        lines.push(`@${baseName} assign "${relPath}"`);
        lines.push(`@${baseName}Content assign`);
        lines.push(`--begin-${token}--`);
        if (content) {
            lines.push(content);
        }
        lines.push(`--end-${token}--`);
    }

    return lines.join('\n');
}
