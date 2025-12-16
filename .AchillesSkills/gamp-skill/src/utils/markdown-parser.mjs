export const extractChapters = (content) => {
    const regex = /^##\s+(.*?)$/gm;
    const matches = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        matches.push({
            heading: match[1].trim(),
            start: match.index,
        });
    }

    return matches.map((entry, index) => {
        const end = index + 1 < matches.length
            ? matches[index + 1].start
            : content.length;
        return {
            heading: entry.heading,
            body: content.slice(entry.start, end).trim(),
            start: entry.start,
            end,
        };
    });
};

export const replaceChapter = (content, heading, newBody) => {
    const chapters = extractChapters(content);
    const chapter = chapters.find((entry) => entry.heading.startsWith(heading));
    if (!chapter) {
        return `${content.trim()}\n\n${newBody.trim()}\n`;
    }
    return `${content.slice(0, chapter.start)}${newBody.trim()}\n${content.slice(chapter.end)}`;
};

export const parseHeading = (heading = '') => {
    const idMatch = heading.match(/(URS|FS|NFS|DS)-\d+/i);
    const id = idMatch ? idMatch[0].toUpperCase() : '';
    const title = heading.includes('–')
        ? heading.split('–')[1].trim()
        : heading.replace(/^(URS|FS|NFS|DS)-\d+\s*[-–]?\s*/i, '').trim();
    return { id, title: title || heading.trim() };
};
