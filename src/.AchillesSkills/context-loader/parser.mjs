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
        return { prompt: '', options: buildDefaults() };
    }

    const raw = stripDependsOn(promptText);
    const optionsMatch = raw.match(/\boptions\s*:\s*/i);

    if (!optionsMatch) {
        return { prompt: raw.trim(), options: buildDefaults() };
    }

    const prompt = raw.slice(0, optionsMatch.index).trim();
    const jsonText = raw.slice(optionsMatch.index + optionsMatch[0].length).trim();

    let parsed = {};
    try {
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
        }
    } catch {
        // Invalid JSON — use defaults
    }

    return { prompt, options: applyDefaults(parsed) };
}

function buildDefaults() {
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

function applyDefaults(parsed) {
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

function stripDependsOn(input) {
    if (!input) return '';
    const match = input.match(/\bdependsOn\s*:\s*/i);
    if (!match || match.index === undefined) return input;
    return input.slice(0, match.index).trimEnd();
}
