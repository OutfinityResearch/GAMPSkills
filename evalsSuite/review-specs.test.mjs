import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { RecursiveSkilledAgent } from '../../RecursiveSkilledAgents/RecursiveSkilledAgent.mjs';

const TEST_TIMEOUT_MS = 180000;
const __filename = fileURLToPath(import.meta.url);
const evalsRoot = path.join(path.dirname(__filename));
const gampSkillsRoot = path.join(evalsRoot, '..');
const fixturesRoot = path.join(evalsRoot, 'fixtures', 'review-specs');

function startTimeout() {
  return setTimeout(() => {
    console.error('[review-specs-test] timed out');
    process.exit(1);
  }, TEST_TIMEOUT_MS);
}

async function copyFixtures(destDir) {
  await fs.cp(fixturesRoot, destDir, { recursive: true });
}

async function runReviewSpecs(agent, targetDir) {
  const result = await agent.executeWithReviewMode(targetDir, { skillName: 'review-specs' }, 'none');
  return result?.result?.output ?? result?.output ?? result;
}

function parseBacklog(content) {
  const sections = {};
  const lines = (content || '').split(/\r?\n/);
  let current = null;
  let collectingIssues = false;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      current = line.slice(3).trim();
      sections[current] = { status: null, issues: [] };
      collectingIssues = false;
      continue;
    }
    if (!current) continue;
    if (line.startsWith('- Status:')) {
      sections[current].status = line.slice('- Status:'.length).trim().toLowerCase();
      collectingIssues = false;
      continue;
    }
    if (line.startsWith('- Issues:')) {
      collectingIssues = true;
      continue;
    }
    if (line.startsWith('- Proposed fixes')) {
      collectingIssues = false;
      continue;
    }
    if (collectingIssues && line.trim().startsWith('- ')) {
      sections[current].issues.push(line.trim().slice(2));
    }
  }
  return sections;
}

function expectRegex(name, value, regex, failures) {
  if (!regex.test(value)) {
    failures.push(`${name}: expected to match ${regex}, got: ${value}`);
  }
}

function logCaseStart(name) {
  console.log(`\n[review-specs-test] Running case: ${name}...`);
}

function logCaseEnd(name, failures) {
  if (failures.length) {
    console.error(`[review-specs-test] Case ${name}: FAIL`);
    for (const f of failures) console.error(`  - ${f}`);
  } else {
    console.log(`[review-specs-test] Case ${name}: PASS`);
  }
}

async function runCase(name, fn, aggregateFailures) {
  const localFailures = [];
  logCaseStart(name);
  await fn(localFailures);
  logCaseEnd(name, localFailures);
  aggregateFailures.push(...localFailures);
}

async function testReviewSpecs() {
  const agent = new RecursiveSkilledAgent({ startDir: gampSkillsRoot });
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'review-specs-'));
  const timer = startTimeout();
  const failures = [];
  try {
    console.log(`[review-specs-test] temp dir: ${tmpDir}`);
    await copyFixtures(tmpDir);

    await runCase('fixtures-set', async (caseFailures) => {
      console.log('[review-specs-test] Generating specs_backlog using review-specs...');
      const output = await runReviewSpecs(agent, tmpDir);
      console.log('[review-specs-test] stdout:', String(output).trim());

      const backlogPath = path.join(tmpDir, 'docs', 'specs_backlog.md');
      const backlog = await fs.readFile(backlogPath, 'utf8');
      console.log('[review-specs-test] Backlog:\n', backlog.trim());

      const sections = parseBacklog(backlog);

      const orphan = sections['orphan.js.md'];
      if (!orphan) {
        caseFailures.push('orphan.js.md section missing');
      } else {
        if (orphan.status === 'ok') {
          caseFailures.push(`orphan.js.md should not be ok (got ${orphan.status})`);
        }
        const joined = orphan.issues.join(' ');
        expectRegex('orphan issues', joined, /miss(ing|ed)|not found|absent/i, caseFailures);
      }

      const vague = sections['vague.js.md'];
      if (!vague) {
        caseFailures.push('vague.js.md section missing');
      } else {
        if (vague.status !== 'needs-info') {
          caseFailures.push(`vague.js.md status should be needs-info (got ${vague.status})`);
        }
        const joined = vague.issues.join(' ');
        expectRegex('vague issues', joined, /missing|unclear|vague|detail/i, caseFailures);
      }

      const inconsistent = sections['inconsistent.js.md'];
      if (!inconsistent) {
        caseFailures.push('inconsistent.js.md section missing');
      } else {
        if (inconsistent.status === 'ok') {
          caseFailures.push(`inconsistent.js.md should not be ok (got ${inconsistent.status})`);
        }
        const joined = inconsistent.issues.join(' ');
        expectRegex('inconsistent issues', joined, /inconsisten|mismatch|add.*multi|multi.*add|discrepanc/i, caseFailures);
      }

      const complete = sections['complete.js.md'];
      if (!complete) {
        caseFailures.push('complete.js.md section missing');
      } else if (complete.status !== 'ok') {
        caseFailures.push(`complete.js.md should be ok (got ${complete.status})`);
      }
    }, failures);

    if (failures.length) {
      console.error('[review-specs-test] Failures found:');
      for (const f of failures) console.error(' -', f);
      process.exit(1);
    }

    console.log('[review-specs-test] all checks passed');
  } finally {
    clearTimeout(timer);
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

testReviewSpecs().catch((err) => {
  console.error(err);
  process.exit(1);
});
