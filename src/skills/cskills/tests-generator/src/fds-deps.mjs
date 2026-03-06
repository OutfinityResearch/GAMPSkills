import fs from 'node:fs/promises';
import path from 'node:path';
import {
    injectDependencyDescriptions,
    parseDependenciesList,
    parseMainFunctionsList,
    parseSections,
} from '../../fds-generator/src/SpecsManager.mjs';
import { fileExists, normalizeKeyPath, normalizeRelativePath } from './path-utils.mjs';

function parseAffectedFiles(sectionText) {
    if (!sectionText || typeof sectionText !== 'string') {
        return [];
    }
    const lines = sectionText.split(/\r?\n/);
    const results = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const bulletMatch = trimmed.match(/^[-*+]\s*(.+)$/);
        const content = bulletMatch ? bulletMatch[1].trim() : trimmed;

        let pathPart = content;
        if (content.includes(' - ')) {
            pathPart = content.split(' - ')[0].trim();
        } else if (content.includes(':')) {
            pathPart = content.split(':')[0].trim();
        }

        const rel = normalizeRelativePath(pathPart);
        if (!rel || !rel.toLowerCase().endsWith('.md')) continue;
        results.push(rel);
    }

    return [...new Set(results)];
}

function buildFdsCandidatePaths(depPath, sourcePath) {
    const normalized = normalizeRelativePath(depPath);
    if (!normalized) return [];

    const candidates = new Set();
    const addCandidate = (candidate) => {
        if (candidate) {
            candidates.add(candidate);
        }
    };

    if (normalized.startsWith('specs/')) {
        addCandidate(path.join(sourcePath, normalized));
        return [...candidates];
    }

    let rel = normalized.replace(/^\.\//, '');
    if (rel.endsWith('.md') || rel.endsWith('.mds')) {
        addCandidate(path.join(sourcePath, rel));
        addCandidate(path.join(sourcePath, 'specs', rel.replace(/^specs\//, '')));
        return [...candidates];
    }

    if (rel.startsWith('src/')) {
        rel = rel.slice(4);
    }

    addCandidate(path.join(sourcePath, 'specs', `${rel}.md`));
    addCandidate(path.join(sourcePath, 'specs', `${rel}.mds`));

    return [...candidates];
}

async function loadFdsMainFunctionsMap(depPath, sourcePath, cache) {
    const candidates = buildFdsCandidatePaths(depPath, sourcePath);
    let fdsPath = null;
    for (const candidate of candidates) {
        const exists = await fileExists(candidate);
        if (exists) {
            fdsPath = candidate;
            break;
        }
    }
    if (!fdsPath) {
        return null;
    }

    if (cache.has(fdsPath)) {
        return cache.get(fdsPath);
    }

    const fdsContent = await fs.readFile(fdsPath, 'utf-8');
    const sections = parseSections(fdsContent);
    const mainFunctionsText = sections.get('Main Functions') || '';
    const mainFunctionsMap = parseMainFunctionsList(mainFunctionsText);
    cache.set(fdsPath, mainFunctionsMap);
    return mainFunctionsMap;
}

async function enrichFdsDependencies(specContent, sourcePath) {
    if (!specContent || typeof specContent !== 'string') {
        return specContent;
    }
    const sections = parseSections(specContent);
    if (!sections.has('Dependencies') || !sections.has('Main Functions')) {
        return specContent;
    }

    const dependenciesText = sections.get('Dependencies') || '';
    const dependencies = parseDependenciesList(dependenciesText);
    if (!dependencies.length) {
        return injectDependencyDescriptions(specContent, () => null, { placeholder: 'MISSING' });
    }

    const cache = new Map();
    const resolvedMap = new Map();
    for (const entry of dependencies) {
        const normalizedPath = normalizeKeyPath(entry.path);
        const key = `${normalizedPath}::${entry.functionName}`;
        const mainFunctionsMap = await loadFdsMainFunctionsMap(entry.path, sourcePath, cache);
        if (!mainFunctionsMap) {
            continue;
        }
        const resolvedLine = mainFunctionsMap.get(entry.functionName);
        if (resolvedLine) {
            resolvedMap.set(key, resolvedLine);
        }
    }

    const resolver = (entry) => {
        const normalizedPath = normalizeKeyPath(entry.path);
        const key = `${normalizedPath}::${entry.functionName}`;
        return resolvedMap.get(key) || null;
    };

    return injectDependencyDescriptions(specContent, resolver, { placeholder: 'MISSING' });
}

export {
    enrichFdsDependencies,
    parseAffectedFiles,
};
