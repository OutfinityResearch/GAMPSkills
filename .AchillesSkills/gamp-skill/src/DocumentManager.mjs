import { readFileSafe, writeFileSafe } from '../../utils/file-io.mjs';
import { extractChapters, replaceChapter, parseHeading } from '../../utils/markdown-parser.mjs';
import { nextId } from '../../utils/id-generator.mjs';
import { buildChapter } from '../../utils/chapter-builder.mjs';
import { ensureTraceabilityBlock, requirementDocName, normaliseId, parseTraceLines } from '../../utils/req-traceability.mjs';
import { buildSoplangComment } from '../../utils/soplang.mjs';

export class DocumentManager {
    constructor(gampRSPCore) {
        this.core = gampRSPCore;
    }

    readDocument(name) {
        return readFileSafe(this.core.getDocPath(name), ''); // Default fallback if needed
    }

    writeDocument(name, content) {
        writeFileSafe(this.core.getDocPath(name), content);
    }

    collectIds(docName, prefix) {
        const content = this.readDocument(docName);
        const chapters = extractChapters(content);
        return chapters
            .map((chapter) => {
                const match = chapter.heading.match(/(URS|FS|NFS)-\d+/i);
                return match ? match[0].toUpperCase() : null;
            })
            .filter((id) => id && id.startsWith(prefix));
    }

    createURS(title, description) {
        const docName = 'URS.md';
        const ids = this.collectIds(docName, 'URS');
        const id = nextId(ids, 'URS');
        const chapter = buildChapter({ id, title, description });
        const content = this.readDocument(docName);
        this.writeDocument(docName, `${content.trim()}\n\n${chapter}\n`);
        return id;
    }

    updateURS(id, title, description) {
        const docName = 'URS.md';
        const chapter = buildChapter({ id, title, description });
        const content = this.readDocument(docName);
        const updated = replaceChapter(content, id, chapter);
        this.writeDocument(docName, updated);
    }

    retireURS(id) {
        this.retireGeneric('URS.md', id);
    }

    createFS(title, description, ursId, reqId = null, linkedDs = []) {
        const docName = 'FS.md';
        const ids = this.collectIds(docName, 'FS');
        const id = reqId || nextId(ids, 'FS');
        const extra = ensureTraceabilityBlock({
            ursId,
            dsIds: linkedDs,
            label: 'Traceability',
            specId: id,
            specType: 'FS',
        });
        const chapter = buildChapter({ id, title, description, extra });
        const content = this.readDocument(docName);
        this.writeDocument(docName, `${content.trim()}\n\n${chapter}\n`);
        return id;
    }

    updateFS(id, title, description, ursId, linkedDs = []) {
        const extra = ensureTraceabilityBlock({
            ursId,
            dsIds: linkedDs,
            label: 'Traceability',
            specId: id,
            specType: 'FS',
        });
        const chapter = buildChapter({ id, title, description, extra });
        const updated = replaceChapter(this.readDocument('FS.md'), id, chapter);
        this.writeDocument('FS.md', updated);
    }

    obsoleteFS(id) {
        this.retireGeneric('FS.md', id);
    }

    createNFS(title, description, ursId, reqId = null, linkedDs = []) {
        const docName = 'NFS.md';
        const ids = this.collectIds(docName, 'NFS');
        const id = reqId || nextId(ids, 'NFS');
        const linkedDsNorm = linkedDs.map((entry) => normaliseId(entry)).filter(Boolean);
        const deps = [];
        if (ursId && ursId !== 'TBD') deps.push(`$${normaliseId(ursId)}`);
        linkedDsNorm.forEach((ds) => deps.push(`$${ds}`));
        const depsStr = deps.length ? deps.join(' ') : '$TBD';
        const soplangCode = `@${id} := ${depsStr}\n@TODO nfs_processing $${id}`;
        const soplangComment = buildSoplangComment(soplangCode);
        const extra = [
            '### Quality Envelope',
            soplangComment,
            '- Attribute: pending',
            `- Linked URS: ${normaliseId(ursId) || 'TBD'}`,
            `- Linked DS: ${linkedDsNorm.length ? linkedDsNorm.join(', ') : 'pending'}`,
        ].join('\n');
        const chapter = buildChapter({ id, title, description, extra });
        const content = this.readDocument(docName);
        this.writeDocument(docName, `${content.trim()}\n\n${chapter}\n`);
        return id;
    }

    updateNFS(id, title, description, ursId, linkedDs = []) {
        const linkedDsNorm = linkedDs.map((entry) => normaliseId(entry)).filter(Boolean);
        const deps = [];
        if (ursId && ursId !== 'TBD') deps.push(`$${normaliseId(ursId)}`);
        linkedDsNorm.forEach((ds) => deps.push(`$${ds}`));
        const depsStr = deps.length ? deps.join(' ') : '$TBD';
        const soplangCode = `@${id} := ${depsStr}\n@TODO nfs_processing $${id}`;
        const soplangComment = buildSoplangComment(soplangCode);
        const extra = [
            '### Quality Envelope',
            soplangComment,
            '- Attribute: pending',
            `- Linked URS: ${normaliseId(ursId) || 'TBD'}`,
            `- Linked DS: ${linkedDsNorm.length ? linkedDsNorm.join(', ') : 'pending'}`,
        ].join('\n');
        const chapter = buildChapter({ id, title, description, extra });
        const updated = replaceChapter(this.readDocument('NFS.md'), id, chapter);
        this.writeDocument('NFS.md', updated);
    }

    obsoleteNFS(id) {
        this.retireGeneric('NFS.md', id);
    }

    retireGeneric(docName, id) {
        const content = this.readDocument(docName);
        const chapters = extractChapters(content);
        const chapter = chapters.find((entry) => entry.heading.startsWith(id));
        if (!chapter) {
            return;
        }
        const updated = chapter.body.replace('Status: active', 'Status: retired');
        const newBody = `## ${id} – ${chapter.heading.split('–')[1].trim()}\n${updated.split('\n').slice(1).join('\n')}`;
        this.writeDocument(docName, replaceChapter(content, id, newBody));
    }

    linkRequirementToDS(reqId, dsId) {
        const targetDoc = requirementDocName(reqId);
        if (!targetDoc) {
            return;
        }
        const normalisedReq = normaliseId(reqId);
        const content = this.readDocument(targetDoc);
        const chapters = extractChapters(content);
        const chapter = chapters.find((entry) => normaliseId(entry.heading).startsWith(normalisedReq));
        if (!chapter) {
            return;
        }
        const dsToken = normaliseId(dsId);
        if (!dsToken) {
            return;
        }
        const lines = chapter.body.split('\n');
        const dsLineIndex = lines.findIndex((line) => /- (Linked\s+)?DS:/i.test(line.trim()));
        if (dsLineIndex >= 0) {
            const existing = lines[dsLineIndex].split(':').slice(1).join(':');
            const tokens = existing.split(',').map((entry) => normaliseId(entry)).filter(Boolean);
            if (!tokens.includes(dsToken)) {
                tokens.push(dsToken);
            }
            lines[dsLineIndex] = `- Linked DS: ${tokens.join(', ')}`;
        } else {
            const traceIdx = lines.findIndex((line) => line.trim().startsWith('### Traceability') || line.trim().startsWith('### Quality Envelope'));
            let insertionIdx = traceIdx >= 0 ? traceIdx + 1 : lines.length;
            while (insertionIdx < lines.length && lines[insertionIdx].trim().startsWith('- ')) {
                insertionIdx += 1;
            }
            lines.splice(insertionIdx, 0, `- Linked DS: ${dsToken}`);
        }
        const updatedBody = lines.join('\n');
        const updatedContent = content.replace(chapter.body, updatedBody);
        this.writeDocument(targetDoc, updatedContent);
    }
}
