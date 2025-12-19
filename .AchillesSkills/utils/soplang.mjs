export const buildSoplangComment = (commands) => {
    const obj = { 'achiles-ide-document': { commands } };
    return `<!--${JSON.stringify(obj)}-->`;
};
