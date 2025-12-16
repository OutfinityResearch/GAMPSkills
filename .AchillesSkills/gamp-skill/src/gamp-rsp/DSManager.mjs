import fs from 'node:fs';
import path from 'node:path';
import { readFileSafe, writeFileSafe, ensureDir } from '../utils/file-io.mjs';
import { nextId } from '../utils/id-generator.mjs';
import { slugifyTitle, normaliseId, formatTimestamp } from '../utils/formatting.mjs';
import { buildSoplangComment } from '../utils/soplang.mjs';
import { extractDSIdFromFileName } from '../utils/req-traceability.mjs';
import { extractChapters, replaceChapter } from '../utils/markdown-parser.mjs';

export class DSManager {
    constructor(gampRSPCore, documentManager) {
        this.core = gampRSPCore;
        this.docManager = documentManager; // Dependency injection for linking requirements
    }

    resolveDSFilePath(dsId, { title = '' } = {}) {
        const normalised = normaliseId(dsId);
        if (!normalised) {
            throw new Error('resolveDSFilePath requires a DS identifier.');
        }
        const dsDir = this.core.getDSDir();
        ensureDir(dsDir);
        const entries = fs.readdirSync(dsDir);
        const match = entries.find((entry) => entry.toUpperCase().startsWith(`${normalised}-`));
        if (match) {
            return path.join(dsDir, match);
        }
        const legacyName = `${normalised}.md`;
        const legacyPath = path.join(dsDir, legacyName);
        if (fs.existsSync(legacyPath)) {
            return legacyPath;
        }
        const slug = slugifyTitle(title || normalised);
        return path.join(dsDir, `${normalised}-${slug}.md`);
    }

    getDSFilePath(dsId) {
        return this.resolveDSFilePath(dsId);
    }

    listDSIds() {
        ensureDir(this.core.getDSDir());
        const entries = fs.readdirSync(this.core.getDSDir());
        return entries
            .map((entry) => extractDSIdFromFileName(entry))
            .filter(Boolean);
    }

    createDS(title, description, architecture, ursIds, reqIds, options = {}) {
        const ids = this.listDSIds();
        const id = nextId(ids, 'DS');
        const timestamp = Date.now();
        const implPath = options.implementationPath || '';
        const dsIds = options.dsIds || [];

        // Normalize to arrays
        const ursArr = Array.isArray(ursIds) ? ursIds : (ursIds ? [ursIds] : []);
        const reqArr = Array.isArray(reqIds) ? reqIds : (reqIds ? [reqIds] : []);
        const dsArr = Array.isArray(dsIds) ? dsIds : (dsIds ? [dsIds] : []);

        // Build dependencies for SOPLang
        const deps = [];
        ursArr.forEach((u) => { if (u) deps.push(`$${normaliseId(u)}`); });
        reqArr.forEach((r) => { if (r) deps.push(`$${normaliseId(r)}`); });
        dsArr.forEach((d) => { if (d) deps.push(`$${normaliseId(d)}`); });
        const depsStr = deps.length ? deps.join(' ') : '$TBD';

        const soplangCode = implPath
            ? `@prompt := $${id} ${depsStr}\n@compiledFile createJSCode $prompt\n@result store "${implPath}" $compiledFile`
            : `@prompt := $${id} ${depsStr}\n@compiledFile createJSCode $prompt\n@result store "TBD" $compiledFile`;
        const soplangComment = buildSoplangComment(soplangCode);

        // Format display strings
        const ursDisplay = ursArr.length ? ursArr.map(normaliseId).join(', ') : 'TBD';
        const reqDisplay = reqArr.length ? reqArr.map(normaliseId).join(', ') : 'TBD';
        const dsDisplay = dsArr.length ? dsArr.map(normaliseId).join(', ') : '';

        const payload = [
            `# ${id} – ${title}`,
            '',
            '## Version',
            '- current: v1.0',
            `- timestamp: ${formatTimestamp(timestamp)}`,
            '',
            '## Scope & Intent',
            description || 'Pending design elaboration.',
            '',
            '## Architecture',
            architecture || 'Architecture TBD.',
            '',
            '## Traceability',
            soplangComment,
            `- URS: ${ursDisplay}`,
            `- Requirements (FS/NFS): ${reqDisplay}`,
            dsDisplay ? `- Related DS: ${dsDisplay}` : '',
            implPath ? `- Implementation: ${implPath}` : '',
            '',
            '## File Impact',
            '_File-level impact entries appear here._',
            '',
            '## Tests',
            '_Add tests via createTest()._',
        ].filter((line) => line !== '').join('\n');
        const target = this.resolveDSFilePath(id, { title });
        writeFileSafe(target, payload);
        reqArr.forEach((r) => this.docManager.linkRequirementToDS(r, id)); // Use DocumentManager for linking
        return id;
    }

    updateDS(id, title, description, architecture) {
        const filePath = this.resolveDSFilePath(id, { title });
        if (!fs.existsSync(filePath)) {
            throw new Error(`DS file ${id} not found.`);
        }
        const content = readFileSafe(filePath);
        const updated = replaceChapter(
            replaceChapter(content, 'Scope & Intent', `## Scope & Intent\n${description || 'Pending design elaboration.'}`),
            'Architecture',
            `## Architecture\n${architecture || 'Architecture TBD.'}`,
        );
        writeFileSafe(filePath, updated);
    }

    createTest(dsId, title, description) {
        const testId = this.nextTestId();
        const block = [
            `### ${testId} – ${title}`,
            `Folder: tests/specs/${testId.toLowerCase()}`,
            `Main Script: run-${testId.toLowerCase()}.mjs`,
            '',
            description || 'Test description pending.',
        ].join('\n');
        this.appendToDS(dsId, block, '## Tests');
        return testId;
    }

    updateTest(testId, title, folder, mainFile, description) {
        const dsFile = this.findDSByTest(testId);
        if (!dsFile) {
            throw new Error(`Test ${testId} not found in any DS.`);
        }
        const content = readFileSafe(dsFile);
        const pattern = new RegExp(`###\s+${testId}\b[\s\S]+?(?=\n###\s+TEST-|$)`, 'i');
        const replacement = [
            `### ${testId} – ${title}`,
            `Folder: ${folder}`,
            `Main Script: ${mainFile}`,
            '',
            description || 'Test description pending.',
        ].join('\n');
        const updated = content.replace(pattern, replacement);
        writeFileSafe(dsFile, updated);
    }

    deleteTest(testId) {
        const dsFile = this.findDSByTest(testId);
        if (!dsFile) {
            return;
        }
        const content = readFileSafe(dsFile);
        const pattern = new RegExp(`\n###\s+${testId}\b[\s\S]+?(?=\n###\s+TEST-|$)`, 'i');
        const updated = content.replace(pattern, '\n');
        writeFileSafe(dsFile, updated);
    }

    nextTestId() {
        const records = [];
        const dsDir = this.core.getDSDir();
        ensureDir(dsDir);
        fs.readdirSync(dsDir).forEach((entry) => {
            const text = readFileSafe(path.join(dsDir, entry));
            const matches = text.match(/TEST-\d+/gi);
            if (matches) {
                records.push(...matches.map((token) => token.toUpperCase()));
            }
        });
        return nextId(records, 'TEST');
    }

    findDSByTest(testId) {
        const dsDir = this.core.getDSDir();
        const entries = fs.readdirSync(dsDir);
        return entries
            .map((entry) => path.join(dsDir, entry))
            .find((filePath) => {
                const text = readFileSafe(filePath);
                return text.includes(`### ${testId}`) || text.includes(`### ${testId.toUpperCase()}`);
            }) || null;
    }

    appendToDS(dsId, block, anchor) {
        const filePath = this.resolveDSFilePath(dsId);
        const content = readFileSafe(filePath);
        const pattern = new RegExp(`${anchor}[\s\S]*?(?=\n##\s+|$)`, 'i');
        const match = content.match(pattern);
        if (!match) {
            writeFileSafe(filePath, `${content.trim()}\n\n${anchor}\n${block}\n`);
            return;
        }
        const replaced = content.replace(pattern, `${match[0].trim()}\n\n${block}`);
        writeFileSafe(filePath, replaced);
    }

    describeFile(dsId, filePath, description, exports = [], dependencies = [], options = {}) {
        const meta = (options && typeof options === 'object' && !Array.isArray(options)) 
            ? options 
            : {};
        const why = meta.why || description || 'Purpose pending.';
        const how = meta.how || 'Implementation details will follow DS guidance.';
        const what = meta.what || 'Resulting artifact captured by this DS.';
        const sideEffects = meta.sideEffects || 'None noted.';
        const concurrency = meta.concurrency || 'Not specified.';
        const normalizedExports = Array.isArray(exports)
            ? exports.map((item) => {
                if (item && typeof item === 'object' && !Array.isArray(item)) {
                    const name = item.name || item.export || '';
                    const desc = item.description || item.detail || '';
                    const diagram = typeof item.diagram === 'string' ? item.diagram.trim() : '';
                    return { name: String(name || '').trim(), description: String(desc || '').trim(), diagram };
                }
                return { name: String(item || '').trim(), description: '', diagram: '' };
            }).filter((entry) => entry.name)
            : [];
        const exportsSection = [
            '',
            '#### Exports',
            normalizedExports.length
                ? normalizedExports.map((entry) => {
                    const lines = [`- ${entry.name}${entry.description ? `: ${entry.description}` : ''}`];
                    if (entry.diagram) {
                        const diagramLines = entry.diagram.split(/\r?\n/);
                        lines.push('  Diagram (ASCII):', '  ```', ...diagramLines, '  ```');
                    }
                    return lines.join('\n');
                }).join('\n')
                : '- none',
        ].join('\n');

        const payload = [
            `### File: ${filePath}`,
            '',
            '#### Why',
            why,
            '',
            '#### How',
            how,
            '',
            '#### What',
            what,
            '',
            '#### Description',
            description || 'Pending description.',
            exportsSection,
            '',
            '#### Dependencies',
            dependencies.length ? dependencies.map((item) => `- ${item}`).join('\n') : '- none',
            '',
            '#### Side Effects',
            sideEffects,
            '',
            '#### Concurrency',
            concurrency,
        ].join('\n');
        this.appendToDS(dsId, payload, '## File Impact');
        return payload;
    }
}
