import { readFile, stat } from 'fs/promises';
import { resolve, extname, relative } from 'path';
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
 * Builds the <context> XML string from accumulated read files.
 * Paths in output are relative to process.cwd().
 * @param {Map<string, string>} readFiles - map of path → content
 * @returns {string}
 */
export function buildContextXml(readFiles) {
    if (readFiles.size === 0) return '<context>\n</context>';

    const cwd = process.cwd();
    const parts = ['<context>'];

    for (const [filePath, content] of readFiles) {
        const relPath = relative(cwd, resolve(filePath));
        const language = extname(filePath).replace('.', '');
        parts.push(`  <file path="${escapeXmlAttr(relPath)}" language="${language}">`);
        parts.push(`    <content>`);
        parts.push(indentContent(content, 6));
        parts.push(`    </content>`);
        parts.push(`  </file>`);
    }

    parts.push('</context>');
    return parts.join('\n');
}

function indentContent(content, spaces) {
    const indent = ' '.repeat(spaces);
    return content
        .split('\n')
        .map(line => indent + line)
        .join('\n');
}

function escapeXmlAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
