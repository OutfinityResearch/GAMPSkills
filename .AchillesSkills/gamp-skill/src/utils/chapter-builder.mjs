import { formatTimestamp } from './formatting.mjs';

export const VERSION_HEADER = (title) => `# ${title}\n\n## Version\n- current: v1.0\n- timestamp: ${formatTimestamp()}\n`;

export const buildChapter = ({ id, title, description, extra = '' }) => [
    `## ${id} – ${title}`,
    `Version: v1.0 (${formatTimestamp()})`,
    'Status: active',
    '',
    '### Description',
    description || 'Pending elaboration.',
    extra ? `\n${extra.trim()}\n` : '',
].join('\n').trim();
