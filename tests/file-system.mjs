import { readFile, rm, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

import { fileURLToPath } from 'node:url';

import { action as fileSystemAction } from '../src/.AchillesSkills/cskills/file-system/src/index.mjs';

const testsDir = path.dirname(fileURLToPath(import.meta.url));

async function runInTempDir(run) {
  const originalCwd = process.cwd();
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'file-system-test-'));

  try {
    process.chdir(tempDir);
    await run(tempDir);
  } finally {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function assertFileContent(filePath, expected) {
  const content = await readFile(filePath, 'utf8');
  assert.equal(content, expected);
}

function logStep(message) {
  console.log(message);
}

function formatPrompt(prompt, limit = 400) {
  if (typeof prompt !== 'string') {
    return String(prompt ?? '');
  }
  if (prompt.length <= limit) {
    return prompt;
  }
  return `${prompt.slice(0, limit)}...`;
}

async function runStep(name, prompt, expectedFile, expectedContent) {
  logStep(`\n[step] ${name}`);
  logStep(`[prompt] ${formatPrompt(prompt)}`);

  try {
    const result = await fileSystemAction({ promptText: prompt, llmAgent: null });
    logStep(`[writeFile] success: ${result}`);
  } catch (error) {
    logStep(`[writeFile] failed: ${error.message}`);
    throw error;
  }

  try {
    const readPrompt = `readFile ${expectedFile}`;
    logStep(`[prompt] ${readPrompt}`);
    const readResult = await fileSystemAction({ promptText: readPrompt, llmAgent: null });
    logStep('[readFile] success');
    await assertFileContent(expectedFile, expectedContent);
    logStep('[assert] content matches expected');
    return readResult;
  } catch (error) {
    logStep(`[readFile/assert] failed: ${error.message}`);
    throw error;
  }
}

async function testMultilineContentWithDestination() {
  const content = [
    '# Title',
    '',
    'Line one of content.',
    'Line two of content.',
  ].join('\n');

  const prompt = [
    'writeFile ./out.txt options: content:',
    content,
    'destination: ./ignored',
  ].join(' ');

  await runStep(
    'multiline content with destination',
    prompt,
    './out.txt',
    content
  );
}

async function testSingleLineContent() {
  const content = 'hello world with spaces';
  const prompt = `writeFile ./single.txt options: content: ${content}`;

  await runStep(
    'single-line content',
    prompt,
    './single.txt',
    content
  );
}

async function testMultilineContentWithoutDestination() {
  const content = [
    'Alpha',
    'Beta',
    'Gamma',
  ].join('\n');

  const prompt = [
    'writeFile ./multi.txt options: content:',
    content,
  ].join(' ');

  await runStep(
    'multiline content without destination',
    prompt,
    './multi.txt',
    content
  );
}

async function testFixtureContent() {
  const fixturePath = path.resolve(testsDir, 'fixtures/DS-file.md');
  const content = await readFile(fixturePath, 'utf8');
  const prompt = [
    'writeFile ./fixture.txt options: content:',
    content,
  ].join(' ');

  await runStep(
    'fixture content from tests/fixtures/DS-file.md',
    prompt,
    './fixture.txt',
    content
  );
}

async function runTests() {
  logStep('[suite] file-system parser tests');
  await runInTempDir(async (tempDir) => {
    logStep(`[env] temp dir: ${tempDir}`);
    await testMultilineContentWithDestination();
    await testSingleLineContent();
    await testMultilineContentWithoutDestination();
    await testFixtureContent();
  });
  logStep('[suite] file-system parser tests completed');
}

runTests().catch((error) => {
  console.error('Test failed:', error);
  process.exitCode = 1;
});
