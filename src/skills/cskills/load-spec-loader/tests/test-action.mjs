import { readFile, rename } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const results = [];

// Resolve paths relative to this test file
const testDir = dirname(fileURLToPath(import.meta.url));
const srcDir = join(testDir, '..', 'src');
const specPath = join(srcDir, 'specsLoader.html');

// Import the module under test
import { action } from '../src/index.mjs';

// Test 1: action() returns exact file contents
try {
  const expectedContent = await readFile(specPath, 'utf8');
  const actualContent = await action();
  results.push({
    expected: expectedContent,
    actual: actualContent,
    pass: actualContent === expectedContent
  });
} catch (e) {
  results.push({
    expected: 'successful read',
    actual: 'error',
    pass: false
  });
}

// Test 2: action() rejects when specsLoader.html is missing
const tempPath = specPath + '.tmp';
let renamed = false;
try {
  await rename(specPath, tempPath);
  renamed = true;
  let actualStatus = 'resolved';
  try {
    await action();
  } catch (e) {
    actualStatus = 'rejected';
  }
  results.push({
    expected: 'rejected',
    actual: actualStatus,
    pass: actualStatus === 'rejected'
  });
} catch (e) {
  results.push({
    expected: 'able to rename for error test',
    actual: 'rename failed',
    pass: false
  });
} finally {
  if (renamed) {
    try {
      await rename(tempPath, specPath);
    } catch {
      // If restoration fails, we still report tests; no extra stdout.
    }
  }
}

process.stdout.write(JSON.stringify({ results }));
