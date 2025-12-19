import fs from 'node:fs';
import path from 'node:path';
import { readFileSafe, writeFileSafe, ensureDir } from '../../utils/file-io.mjs';
import { extractChapters, parseHeading } from '../../utils/markdown-parser.mjs';
import { formatTimestamp, renderTable } from '../../utils/formatting.mjs';
import { parseDSTrace, parseTraceLines, extractDSIdFromFileName } from '../../utils/req-traceability.mjs';
import { buildSoplangComment } from '../../utils/soplang.mjs';
import { DEFAULT_DOCS } from '../../utils/constants.mjs';

export class ReportingManager {
    constructor(gampRSPCore, documentManager) {
        this.core = gampRSPCore;
        this.docManager = documentManager;
        this.refreshMatrix(); // Ensure matrix is generated on initialization
    }

    loadSpecs(filterText = '') {
        this.refreshMatrix();
        const docs = [
            { name: 'matrix', content: readFileSafe(this.core.getMatrixPath()) },
            ...DEFAULT_DOCS.map(({ filename }) => ({
                name: filename.replace('.md', ''),
                content: readFileSafe(this.core.getDocPath(filename)),
            })),
        ];
        const dsEntries = fs.readdirSync(this.core.getDSDir()).map((entry) => ({
            name: entry.replace('.md', ''),
            content: readFileSafe(path.join(this.core.getDSDir(), entry)),
        }));
        const combined = [...docs, ...dsEntries];
        if (!filterText) {
            return combined.map((entry) => `# ${entry.name}\n${entry.content}`).join('\n\n');
        }
        return combined
            .filter((entry) => entry.content.toLowerCase().includes(filterText.toLowerCase()))
            .map((entry) => `# ${entry.name}\n${entry.content}`)
            .join('\n\n');
    }

    generateHtmlDocs() {
        this.refreshMatrix();
        const docsDir = this.core.getDocsDir();
        ensureDir(docsDir);
        const html = (title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; line-height: 1.5; }
        pre { background: #f4f4f4; padding: 1rem; overflow-x: auto; }
        h1, h2, h3 { color: #003366; }
        ul { line-height: 1.8; }
        a { color: #0050a4; text-decoration: none; }
    </style>
</head>
<body>
${body}
</body>
</html>`;
        const extractTitle = (content, fallback) => {
            const match = content.match(/^#\s+(.+)$/m);
            return match ? match[1].trim() : fallback;
        };
        const extractDescription = (content) => {
            const match = content.match(/###\s+Description\s+([\s\S]+?)(?:\n###|\n$)/i);
            if (match) {
                return match[1].trim().replace(/\n+/g, ' ');
            }
            return '';
        };
        const pages = [];
        const addPage = (href, title, section, description = '') => {
            pages.push({ href, title, section, description });
        };

        const files = [
            { name: 'URS.html', source: 'URS.md' },
            { name: 'FS.html', source: 'FS.md' },
            { name: 'NFS.html', source: 'NFS.md' },
        ];
        files.forEach(({ name, source }) => {
            const content = readFileSafe(this.core.getDocPath(source));
            const title = extractTitle(content, source.replace('.md', '').toUpperCase());
            writeFileSafe(path.join(docsDir, name), html(title, `<pre>${content}</pre>`));
            addPage(name, title, 'core', extractDescription(content));
        });

        const dsEntries = fs.readdirSync(this.core.getDSDir())
            .filter((entry) => entry.toLowerCase().endsWith('.md'))
            .sort();
        dsEntries.forEach((entry) => {
            const content = readFileSafe(path.join(this.core.getDSDir(), entry));
            const heading = (content.match(/^#\s+(.+)$/m) || [])[1] || entry.replace('.md', '');
            const { id, title } = parseHeading(heading);
            const name = `${entry.replace('.md', '')}.html`;
            writeFileSafe(path.join(docsDir, name), html(heading, `<pre>${content}</pre>`));
            addPage(name, heading, 'ds', extractDescription(content));
        });

        const matrixPath = this.core.getMatrixPath();
        if (fs.existsSync(matrixPath)) {
            const content = readFileSafe(matrixPath);
            const title = extractTitle(content, 'Specification Matrix');
            writeFileSafe(path.join(docsDir, 'matrix.html'), html(title, `<pre>${content}</pre>`));
            addPage('matrix.html', title, 'matrix', extractDescription(content));
        }

        const renderList = (heading, filter) => {
            const entries = pages.filter((page) => page.section === filter);
            if (!entries.length) {
                return '';
            }
            const items = entries
                .map((page) => `<li><a href="${page.href}">${page.title}</a>${page.description ? ` – ${page.description}` : ''}</li>`)
                .join('\n');
            return `<h2>${heading}</h2>\n<ul>\n${items}\n</ul>`;
        };

        const indexBody = [
            '<h1>Specification Index</h1>',
            renderList('Core Specifications', 'core'),
            renderList('Traceability Matrix', 'matrix'),
            renderList('Design Specifications', 'ds'),
        ].filter(Boolean).join('\n\n');
        writeFileSafe(path.join(docsDir, 'index.html'), html('Specification Index', indexBody));
        return docsDir;
    }

    refreshMatrix() {
        this.core.ensureWorkspace(); // Ensure workspace is ready

        const ursChapters = extractChapters(this.docManager.readDocument('URS.md'))
            .map((entry) => ({ ...parseHeading(entry.heading), body: entry.body }))
            .filter((entry) => entry.id.startsWith('URS'));
        const fsChapters = extractChapters(this.docManager.readDocument('FS.md'))
            .map((entry) => ({ ...parseHeading(entry.heading), body: entry.body }))
            .filter((entry) => entry.id.startsWith('FS'));
        const nfsChapters = extractChapters(this.docManager.readDocument('NFS.md'))
            .map((entry) => ({ ...parseHeading(entry.heading), body: entry.body }))
            .filter((entry) => entry.id.startsWith('NFS'));
        const dsDir = this.core.getDSDir();
        const dsEntries = fs.readdirSync(dsDir)
            .filter((entry) => entry.toLowerCase().endsWith('.md'))
            .map((entry) => {
                const content = readFileSafe(path.join(dsDir, entry));
                const heading = (content.match(/^#\s+(.+)$/m) || [])[1] || entry.replace('.md', '');
                const { id, title } = parseHeading(heading);
                const trace = parseDSTrace(content);
                return {
                    id: id || extractDSIdFromFileName(entry) || heading,
                    title: title || heading,
                    fileName: entry,
                    ...trace
                };
            })
            .filter((entry) => entry.id);

        const ursRows = ursChapters.map((entry) => [entry.id, entry.title]);
        const fsRows = fsChapters.map((entry) => {
            const trace = parseTraceLines(entry.body);
            return [entry.id, trace.urs || 'TBD', trace.ds.join(', ') || 'pending', entry.title];
        });
        const nfsRows = nfsChapters.map((entry) => {
            const trace = parseTraceLines(entry.body);
            return [entry.id, trace.urs || 'TBD', trace.ds.join(', ') || 'pending', entry.title];
        });
        const dsRows = dsEntries.map((entry) => [
            entry.id,
            entry.urs || 'TBD',
            entry.req || 'TBD',
        ]);

        const soplangVars = [];
        ursChapters.forEach((entry) => {
            soplangVars.push(`@${entry.id} load URS.md#${entry.id}`);
        });
        fsChapters.forEach((entry) => {
            soplangVars.push(`@${entry.id} load FS.md#${entry.id}`);
        });
        nfsChapters.forEach((entry) => {
            soplangVars.push(`@${entry.id} load NFS.md#${entry.id}`);
        });
        dsEntries.forEach((entry) => {
            soplangVars.push(`@${entry.id} load DS/${entry.fileName}`);
        });

        const soplangCode = soplangVars.join('\\n');
        const soplangComment = buildSoplangComment(soplangCode);

        const content = [
            soplangComment,
            '',
            '# Specification Matrix',
            `_Last updated: ${formatTimestamp()}`,
            '',
            'Traceability between URS/FS/NFS requirements and DS designs.',
            '',
            '## URS',
            renderTable(['URS', 'Title'], ursRows),
            '',
            '## FS ↔ URS/DS',
            renderTable(['FS', 'URS', 'Linked DS', 'Title'], fsRows),
            '',
            '## NFS ↔ URS/DS',
            renderTable(['NFS', 'URS', 'Linked DS', 'Title'], nfsRows),
            '',
            '## DS ↔ Requirements',
            renderTable(['DS', 'URS', 'Requirement'], dsRows),
        ].join('\n');

        writeFileSafe(this.core.getMatrixPath(), `${content.trim()}\n`);
        return this.core.getMatrixPath();
    }
}
