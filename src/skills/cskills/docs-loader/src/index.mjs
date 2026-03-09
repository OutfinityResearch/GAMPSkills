import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);
const rootDir = resolve(currentDir, '..', '..', '..', '..', '..');

function normalizeDocName(promptText) {
  const name = String(promptText || '').trim();
  if (!name) {
    throw new Error('Error: No input provided for docs-loader.');
  }
  if (name.includes('/') || name.includes('\\') || name.includes('..')) {
    throw new Error(`Error: Invalid document name: ${name}`);
  }
  return name;
}

export async function action(context) {
  const { promptText } = context || {};
  const docName = normalizeDocName(promptText);
  const docPath = join(rootDir, 'docs', `${docName}.md`);

  try {
    const content = await readFile(docPath, 'utf8');
    return content;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new Error(`Error: Documentation file not found: ${docName}.md`);
    }
    throw error;
  }
}
