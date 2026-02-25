import { parseKeyValueOptions } from '../../../../utils/optionsParser.mjs';
import { stripDependsOn } from '../../../../utils/ArgumentResolver.mjs';

const KNOWN_OPTIONS = new Set([
    'dir', 'filter', 'maxDepth', 'exclude', 'maxFiles', 'maxFileSize', 'include',
]);

/**
 * Parses promptText into { prompt, options }.
 * Format: "<prompt text> options: {JSON}"
 * Without options: "<prompt text>"
 */
export function parseInput(promptText) {
    if (!promptText || typeof promptText !== 'string') {
        return { prompt: '', options: buildDefaults(), optionsRaw: '', parseError: null };
    }

    const raw = stripDependsOn(promptText);
    const optionsMatch = raw.match(/\boptions\s*:\s*/i);

    if (!optionsMatch) {
        return { prompt: raw.trim(), options: buildDefaults(), optionsRaw: '', parseError: null };
    }

    const prompt = raw.slice(0, optionsMatch.index).trim();
    const optionsRaw = raw.slice(optionsMatch.index + optionsMatch[0].length).trim();

    try {
        const parsed = parseKeyValueOptions(optionsRaw, {
            allowedKeys: KNOWN_OPTIONS,
            repeatableKeys: new Set(['include']),
        });
        return { prompt, options: applyDefaults(parsed), optionsRaw, parseError: null };
    } catch (error) {
        return { prompt, options: buildDefaults(), optionsRaw, parseError: error };
    }
}

export function buildDefaults() {
    return {
        dir: '.',
        filter: null,
        maxDepth: 2,
        exclude: null,
        maxFiles: null,
        maxFileSize: null,
        include: null,
    };
}

export function applyDefaults(parsed) {
    const defaults = buildDefaults();

    if (typeof parsed.dir === 'string' && parsed.dir.trim()) {
        defaults.dir = parsed.dir.trim();
    }
    if (typeof parsed.filter === 'string' && parsed.filter.trim()) {
        defaults.filter = parsed.filter.trim();
    }
    if (parsed.maxDepth !== undefined) {
        const n = Number(parsed.maxDepth);
        if (Number.isFinite(n) && n > 0) defaults.maxDepth = n;
    }
    if (typeof parsed.exclude === 'string' && parsed.exclude.trim()) {
        defaults.exclude = parsed.exclude.trim();
    }
    if (parsed.maxFiles !== undefined) {
        const n = Number(parsed.maxFiles);
        if (Number.isFinite(n) && n > 0) defaults.maxFiles = n;
    }
    if (parsed.maxFileSize !== undefined) {
        const n = Number(parsed.maxFileSize);
        if (Number.isFinite(n) && n > 0) defaults.maxFileSize = n;
    }
    if (parsed.include !== undefined) {
        if (Array.isArray(parsed.include)) {
            const filtered = parsed.include.filter(s => typeof s === 'string' && s.trim());
            if (filtered.length > 0) defaults.include = filtered;
        } else if (typeof parsed.include === 'string' && parsed.include.trim()) {
            defaults.include = parsed.include.split(',').map(s => s.trim()).filter(Boolean);
        }
    }

    return defaults;
}
