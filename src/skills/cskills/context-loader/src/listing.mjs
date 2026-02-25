import { readdir } from 'fs/promises';
import { resolve, join } from 'path';

const EXCLUDED_DIRS = new Set([
    'node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.cache',
]);

/**
 * Lists directory contents recursively, applying filter/exclude/depth options.
 * @param {object} options - { dir, filter, maxDepth, exclude }
 * @returns {Promise<string[]>} - flat array of relative paths (relative to options.dir)
 */
export async function listDirectory(options) {
    const { dir = '.', filter = null, maxDepth = 2, exclude = null } = options;

    const filterMatcher = filter ? buildMatcher(filter) : null;
    const excludeMatcher = exclude ? buildMatcher(exclude) : null;

    const entries = [];
    const baseDir = resolve(dir);
    const applyExclusions = shouldApplyExclusions(dir);

    async function walk(currentDir, depth, relativePath) {
        if (depth > maxDepth) return;
        let dirEntries;
        try {
            dirEntries = await readdir(currentDir, { withFileTypes: true });
        } catch { return; }

        for (const entry of dirEntries) {
            if (applyExclusions && EXCLUDED_DIRS.has(entry.name)) continue;
            if (entry.name.startsWith('.') && entry.isDirectory()) continue;

            const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

            // Apply exclude pattern
            if (excludeMatcher && excludeMatcher(entry.name)) continue;

            if (entry.isDirectory()) {
                entries.push(relPath);
                await walk(join(currentDir, entry.name), depth + 1, relPath);
            } else {
                // Apply filter pattern (only on files)
                if (filterMatcher && !filterMatcher(entry.name)) continue;
                entries.push(relPath);
            }
        }
    }

    await walk(baseDir, 1, '');
    return entries;
}

/**
 * Converts a glob pattern to a matcher function.
 * Supports * (any chars) and ? (single char).
 * @param {string} pattern - glob pattern (e.g. "*.md", "*.test.*")
 * @returns {(value: string) => boolean}
 */
export function buildMatcher(pattern) {
    if (!pattern) return () => true;

    const escaped = String(pattern)
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
    const regex = new RegExp(`^${escaped}$`);
    return (value) => regex.test(value);
}

/**
 * Determines if default directory exclusions should be applied.
 * If the dir path itself contains an excluded directory segment,
 * exclusions are disabled (the user explicitly targets that location).
 */
function shouldApplyExclusions(dir) {
    const segments = dir.replace(/\\/g, '/').split('/').filter(Boolean);
    return !segments.some(seg => EXCLUDED_DIRS.has(seg));
}
