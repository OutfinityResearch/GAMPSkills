export const formatTimestamp = (value = Date.now()) => {
    const ms = Number.isFinite(Number(value)) ? Number(value) : Date.now();
    return new Date(ms).toISOString();
};

export const renderTable = (headers = [], rows = []) => {
    if (!rows.length) {
        return '_No entries defined._';
    }
    const head = `| ${headers.join(' | ')} |`;
    const sep = `| ${headers.map(() => '---').join(' | ')} |`;
    const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
    return [head, sep, body].join('\n');
};

export const slugifyTitle = (value) => {
    if (!value || typeof value !== 'string') {
        return 'design';
    }
    const cleaned = value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return cleaned || 'design';
};

export const normaliseId = (value) => {
    if (!value || typeof value !== 'string') {
        return '';
    }
    return value.trim().toUpperCase();
};
