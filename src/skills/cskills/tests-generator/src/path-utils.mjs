import fs from 'node:fs/promises';

async function fileExists(filePath) {
    return fs.stat(filePath).then(stat => stat.isFile()).catch(() => false);
}

function normalizeKeyPath(value) {
    if (typeof value !== 'string') {
        return '';
    }
    return value.replace(/\\/g, '/').trim();
}

function normalizeRelativePath(value) {
    if (typeof value !== 'string') {
        return '';
    }
    const normalized = value.replace(/\\/g, '/').trim();
    return normalized.replace(/^\.\//, '');
}

export {
    fileExists,
    normalizeKeyPath,
    normalizeRelativePath,
};
