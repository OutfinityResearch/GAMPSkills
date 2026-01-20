export async function action(context) {
    const { prompt } = context;
    const match = prompt.match(/content:\s*(.+)/s);
    if (!match) throw new Error('Invalid prompt format for parse-file-markers: expected "content: ..."');
    const content = match[1].trim();
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