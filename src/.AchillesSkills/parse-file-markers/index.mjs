export async function action(context) {
    const { rawText } = context;
    if (!rawText) {
        throw new Error('Invalid input for parse-file-markers: expected rawText.');
    }
    const content = String(rawText).trim();
    const files = {};
    const regex = /^<!--\s*FILE:\s*(.+?)\s*-->$/gm;
    let matchFile;
    while ((matchFile = regex.exec(content)) !== null) {
        const path = matchFile[1].trim();
        const start = matchFile.index + matchFile[0].length;
        const nextMatch = regex.exec(content);
        const end = nextMatch ? nextMatch.index : content.length;
        files[path] = content.slice(start, end).trim();
    }
    return files;
}
