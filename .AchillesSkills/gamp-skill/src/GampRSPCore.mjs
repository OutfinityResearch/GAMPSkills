import path from 'node:path';
import fs from 'node:fs';
import { ensureDir, writeFileSafe, readFileSafe } from '../../utils/file-io.mjs';
import { VERSION_HEADER } from '../../utils/chapter-builder.mjs';
import { DEFAULT_DOCS } from '../../utils/constants.mjs';
import { extractDSIdFromFileName } from '../../utils/req-traceability.mjs';
import { slugifyTitle } from '../../utils/formatting.mjs';

export class GampRSPCore {
    constructor(workspaceRoot = process.cwd()) {
        this.workspaceRoot = workspaceRoot;
        this.specsDir = path.join(this.workspaceRoot, '.specs');
        this.initialised = false;
        // The refreshMatrix call is moved to ReportingManager
        this.ensureWorkspace();
    }

    configure(workspaceRoot = process.cwd()) {
        this.workspaceRoot = workspaceRoot;
        this.specsDir = path.join(workspaceRoot, '.specs');
        this.initialised = false;
        this.ensureWorkspace();
    }

    ensureWorkspace() {
        if (this.initialised) {
            return;
        }
        ensureDir(this.specsDir);
        DEFAULT_DOCS.forEach(({ filename, title }) => {
            const target = path.join(this.specsDir, filename);
            if (!fs.existsSync(target)) {
                writeFileSafe(target, VERSION_HEADER(title));
            }
        });
        ensureDir(this.getDSDir());
        ensureDir(this.getMockDir());
        ensureDir(this.getDocsDir());
        const ignorePath = this.getIgnorePath();
        if (!fs.existsSync(ignorePath)) {
            writeFileSafe(ignorePath, ['node_modules', '.git', 'dist', 'coverage'].join('\n'));
        }
        this.initialised = true;
    }

    getDocPath(name) {
        return path.join(this.specsDir, name);
    }

    getSpecsDirectory() {
        this.ensureWorkspace();
        return this.specsDir;
    }

    getDSDir() {
        return path.join(this.specsDir, 'DS');
    }

    resolveDSFilePath(dsId, { title = '' } = {}) {
        const normalised = normaliseId(dsId); // Using helper here for consistency
        if (!normalised) {
            throw new Error('resolveDSFilePath requires a DS identifier.');
        }
        const dsDir = this.getDSDir();
        ensureDir(dsDir);
        const entries = fs.readdirSync(dsDir);
        const match = entries.find((entry) => entry.toUpperCase().startsWith(`${normalised}-`));
        if (match) {
            return path.join(dsDir, match);
        }
        const slug = title ? slugifyTitle(title) : 'design'; // Using slugifyTitle helper
        return path.join(dsDir, `${normalised}-${slug}.md`);
    }

    getMockDir() {
        return path.join(this.specsDir, 'mock');
    }

    getDocsDir() {
        return path.join(this.specsDir, 'html_docs');
    }

    getMatrixPath() {
        return path.join(this.specsDir, 'matrix.md');
    }

    getIgnorePath() {
        return path.join(this.specsDir, '.ignore');
    }

    readIgnoreList() {
        return readFileSafe(this.getIgnorePath(), '')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
    }

    addIgnoreEntries(entries = []) {
        const list = new Set(this.readIgnoreList());
        entries.forEach((entry) => {
            if (entry) {
                list.add(entry.trim());
            }
        });
        writeFileSafe(this.getIgnorePath(), Array.from(list).join('\n'));
        return Array.from(list);
    }

    getCachePath() {
        return path.join(this.specsDir, '.gamp-cache.json');
    }

    readCache() {
        const cachePath = this.getCachePath();
        if (!fs.existsSync(cachePath)) {
            return {};
        }
        try {
            return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        } catch {
            return {};
        }
    }

    writeCache(data = {}) {
        writeFileSafe(this.getCachePath(), `${JSON.stringify(data, null, 2)}\n`);
    }
}