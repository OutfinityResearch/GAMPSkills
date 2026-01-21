import { glob } from 'glob';

export async function action(context) {
    const { rootPath, options = {} } = context;
    if (!rootPath) {
        throw new Error('Invalid input for scan-directory: expected rootPath.');
    }
    const include = options.include || (options.recursive === false ? '*' : '**/*');
    const exclude = options.exclude || '';
    const globOptions = { cwd: String(rootPath).trim(), absolute: false };
    if (exclude) {
        globOptions.ignore = exclude;
    }
    const files = await glob(include, globOptions);
    return files;
}
