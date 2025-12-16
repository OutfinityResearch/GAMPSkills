import { normaliseId } from './formatting.mjs';
import { buildSoplangComment } from './soplang.mjs';

export const requirementDocName = (reqId) => {
    const normalised = normaliseId(reqId);
    if (normalised.startsWith('FS-')) {
        return 'FS.md';
    }
    if (normalised.startsWith('NFS-')) {
        return 'NFS.md';
    }
    return null;
};

export const parseTraceLines = (body = '') => {
    const lines = body.split(/\r?\n/).map((line) => line.trim());
    const ursLine = lines.find((line) => /^-\s+(Source\s+)?URS:/i.test(line) || /^-\s+Linked\s+URS:/i.test(line));
    const dsLine = lines.find((line) => /^-\s+(Linked\s+)?DS:/i.test(line));
    const urs = ursLine ? normaliseId(ursLine.split(':').slice(1).join(':')) : '';
    const dsTokens = dsLine
        ? dsLine.split(':').slice(1).join(':')
            .split(',')
            .map((entry) => normaliseId(entry))
            .filter((entry) => entry && entry !== 'PENDING')
        : [];
    return { urs, ds: dsTokens };
};

export const parseDSTrace = (content = '') => {
    const ursMatch = content.match(/-\s*URS:\s*([A-Z0-9-]+)/i);
    const reqMatch = content.match(/-\s*(?:Requirement|Req):\s*([A-Z0-9-]+)/i);
    return {
        urs: ursMatch ? normaliseId(ursMatch[1]) : '',
        req: reqMatch ? normaliseId(reqMatch[1]) : '',
    };
};

export const ensureTraceabilityBlock = ({
    ursId = 'TBD',
    dsIds = [],
    label = 'Traceability',
    specId = '',
    specType = 'FS',
}) => {
    const linkedDs = Array.from(new Set(dsIds.map((entry) => normaliseId(entry)).filter(Boolean)));
    const dsValue = linkedDs.length ? linkedDs.join(', ') : 'pending';
    const deps = [];
    if (ursId && ursId !== 'TBD') deps.push(`$${normaliseId(ursId)}`);
    linkedDs.forEach((ds) => deps.push(`$${ds}`));
    const depsStr = deps.length ? deps.join(' ') : '$TBD';
    const soplangCode = `@${specId || specType} := ${depsStr}\n@TODO ${specType.toLowerCase()}_processing $${specId || specType}`;
    const soplangComment = buildSoplangComment(soplangCode);
    return [
        `### ${label}`,
        soplangComment,
        `- Source URS: ${normaliseId(ursId) || 'TBD'}`,
        `- Linked DS: ${dsValue}`,
    ].join('\n');
};

export const extractDSIdFromFileName = (fileName) => {
    if (!fileName) {
        return null;
    }
    const match = fileName.match(/(DS-\d+)/i);
    return match ? match[1].toUpperCase() : null;
};
