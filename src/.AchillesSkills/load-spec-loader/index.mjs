import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);
const specLoaderPath = join(currentDir, 'specsLoader.html');

export async function action() {
  const content = await readFile(specLoaderPath, 'utf8');
  return content;
}