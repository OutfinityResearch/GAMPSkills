import fs from 'node:fs';
import path from 'node:path';

export const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

export const readFileSafe = (filePath, fallback = '') => {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch {
        return fallback;
    }
};

export const writeFileSafe = (filePath, content) => {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
};
