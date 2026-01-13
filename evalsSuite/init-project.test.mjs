import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import assert from 'assert';
import { fileURLToPath } from 'url';
import { RecursiveSkilledAgent } from '../../RecursiveSkilledAgents/RecursiveSkilledAgent.mjs';

const __filename = fileURLToPath(import.meta.url);
const evalsRoot = path.join(path.dirname(__filename));
const repoRoot = path.join(evalsRoot, '..', '..');

async function runInitProject(tmpDir) {
  const agent = new RecursiveSkilledAgent({ startDir: repoRoot });
  const result = await agent.executeWithReviewMode('', { skillName: 'init-project', input: `${tmpDir} stub prompt` }, 'none');
  return { code: 0, stdout: result, stderr: '' };
}

async function readFileSafe(p) {
  try {
    return await fs.readFile(p, 'utf8');
  } catch {
    return null;
  }
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function testInitProject() {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'init-project-'));
  console.log(`[init-project-test] temp dir: ${tmpDir}`);

  console.log('[init-project-test] running agent skill');
  const result = await runInitProject(tmpDir);
  console.log('[init-project-test] stdout:', String(result.stdout).trim());
  console.log('[init-project-test] stderr:', String(result.stderr).trim());

  assert.strictEqual(result.code, 0, `exit code should be 0; stderr=${result.stderr}`);
  assert.ok(String(result.stdout).includes('init-project: initialized docs'), 'should report initialized docs');

  const expectedDirs = [
    'docs',
    path.join('docs', 'specs'),
    path.join('docs', 'gamp'),
    path.join('docs', 'specs', 'src'),
    path.join('docs', 'specs', 'tests'),
  ];
  for (const rel of expectedDirs) {
    const full = path.join(tmpDir, rel);
    console.log(`[init-project-test] verifying directory exists: ${full}`);
    assert.ok(await pathExists(full), `directory missing: ${rel}`);
  }

  const specsBacklogPath = path.join(tmpDir, 'docs', 'specs_backlog.m');
  const docsBacklogPath = path.join(tmpDir, 'docs', 'docs_backlog');
  console.log(`[init-project-test] verifying file exists: ${specsBacklogPath}`);
  assert.ok(await pathExists(specsBacklogPath), 'specs_backlog.m missing');
  console.log(`[init-project-test] verifying file exists: ${docsBacklogPath}`);
  assert.ok(await pathExists(docsBacklogPath), 'docs_backlog missing');

  const docsBacklog = await readFileSafe(docsBacklogPath);
  console.log('[init-project-test] docs_backlog content:', (docsBacklog || '').trim());
  assert.ok(docsBacklog && docsBacklog.includes('Here will be backlog for docs'), 'docs_backlog content');

  const specsBacklog = await readFileSafe(specsBacklogPath);
  console.log('[init-project-test] specs_backlog.m content preview:', (specsBacklog || '').split('\n').slice(0, 5).join('\n'));
  assert.ok(specsBacklog && specsBacklog.includes('Status'), 'specs_backlog.m content should include Status');
}

testInitProject().catch((err) => {
  console.error(err);
  process.exit(1);
});
