import fs from 'node:fs/promises';
import path from 'node:path';
import { parseSections } from '../../../fds-generator/src/SpecsManager.mjs';

function isTestingContentUsable(testingText) {
    if (typeof testingText !== 'string') {
        return false;
    }
    return testingText.trim().length > 0;
}

function getTestingSectionFromFds(content) {
    if (typeof content !== 'string') {
        return '';
    }
    const sections = parseSections(content);
    return sections.get('Testing') || '';
}

async function listSpecFiles(dirPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const results = [];
    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (entry.name === '.backup') {
                continue;
            }
            const nested = await listSpecFiles(path.join(dirPath, entry.name));
            results.push(...nested);
            continue;
        }
        if (entry.isFile() && /\.mds?$/i.test(entry.name)) {
            results.push(path.join(dirPath, entry.name));
        }
    }
    return results;
}

async function hasNonEmptyTestingInSpecsDir(specsDir) {
    const specsExists = await fs.stat(specsDir).then(stat => stat.isDirectory()).catch(() => false);
    if (!specsExists) {
        return false;
    }
    const specFiles = await listSpecFiles(specsDir);
    if (specFiles.length === 0) {
        return false;
    }
    for (const specPath of specFiles) {
        const content = await fs.readFile(specPath, 'utf-8');
        const testing = getTestingSectionFromFds(content);
        if (isTestingContentUsable(testing)) {
            return true;
        }
    }
    return false;
}

export {
    getTestingSectionFromFds,
    hasNonEmptyTestingInSpecsDir,
    isTestingContentUsable,
    listSpecFiles,
};
