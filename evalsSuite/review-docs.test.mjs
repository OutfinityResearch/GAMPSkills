import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { RecursiveSkilledAgent } from '../../RecursiveSkilledAgents/RecursiveSkilledAgent.mjs';

const TEST_TIMEOUT_MS = 180000;
const __filename = fileURLToPath(import.meta.url);
const evalsRoot = path.join(path.dirname(__filename));
const gampSkillsRoot = path.join(evalsRoot, '..');
const fixturesRoot = path.join(evalsRoot, 'fixtures', 'review-docs');

function startTimeout() {
  return setTimeout(() => {
    console.error('[review-docs-test] timed out');
    process.exit(1);
  }, TEST_TIMEOUT_MS);
}

async function copyFixtures(destDir) {
  await fs.cp(fixturesRoot, destDir, { recursive: true });
}

async function runReviewDocs(agent, targetDir) {
  const result = await agent.executeWithReviewMode(
    targetDir,
    { skillName: 'review-docs', targetDir },
    'none'
  );
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
    if (line.startsWith('- Description:')) {
      continue;
    }
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
  console.log(`\n[review-docs-test] Running case: ${name}...`);
}

function logCaseEnd(name, failures) {
  if (failures.length) {
    console.error(`[review-docs-test] Case ${name}: FAIL`);
    for (const f of failures) console.error(`  - ${f}`);
  } else {
    console.log(`[review-docs-test] Case ${name}: PASS`);
  }
}

async function runCase(name, fn, aggregateFailures) {
  const localFailures = [];
  logCaseStart(name);
  await fn(localFailures);
  logCaseEnd(name, localFailures);
  aggregateFailures.push(...localFailures);
}

async function testReviewDocs() {
  const agent = new RecursiveSkilledAgent({ startDir: gampSkillsRoot });
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'review-docs-'));
  const timer = startTimeout();
  const failures = [];
  try {
    console.log(`[review-docs-test] temp dir: ${tmpDir}`);
    await copyFixtures(tmpDir);

    await runCase('fixtures-set', async (caseFailures) => {
      console.log('[review-docs-test] Generating docs_backlog using review-docs...');
      const output = await runReviewDocs(agent, tmpDir);
      console.log('[review-docs-test] stdout:', String(output).trim());

      const backlogPath = path.join(tmpDir, 'docs', 'docs_backlog.md');
      const backlog = await fs.readFile(backlogPath, 'utf8');
      console.log('[review-docs-test] Backlog:\n', backlog.trim());

      const sections = parseBacklog(backlog);

      const complete = sections['docs/complete.html'];
      if (!complete) {
        caseFailures.push('complete.html section missing');
      } else if (complete.status !== 'ok') {
        caseFailures.push(`complete.html should be ok (got ${complete.status})`);
      }

      const vague = sections['docs/vague.html'];
      if (!vague) {
        caseFailures.push('vague.html section missing');
      } else {
        if (vague.status === 'ok') {
          caseFailures.push(`vague.html status should not be ok (got ${vague.status})`);
        }
        const joined = vague.issues.join(' ');
        expectRegex('vague issues', joined, /missing|unclear|vague|detail/i, caseFailures);
      }

      const inconsistent = sections['docs/inconsistent.html'];
      if (!inconsistent) {
        caseFailures.push('inconsistent.html section missing');
      } else {
        if (inconsistent.status === 'ok') {
          caseFailures.push(`inconsistent.html should not be ok (got ${inconsistent.status})`);
        }
        const joined = inconsistent.issues.join(' ');
        expectRegex(
          'inconsistent issues',
          joined,
          /(inconsisten|mismatch|contradic|purpose|terminolog|missing purpose|missing usage|no examples)/i,
          caseFailures
        );
      }

      const broken = sections['docs/broken.html'];
      if (!broken) {
        caseFailures.push('broken.html section missing');
      } else {
        if (broken.status === 'ok') {
          caseFailures.push(`broken.html should not be ok (got ${broken.status})`);
        }
        const joined = broken.issues.join(' ');
        expectRegex('broken issues', joined, /(structur|missing|incomplete|no examples|unclear|broken)/i, caseFailures);
      }

      const orphan = sections['docs/orphan.html'];
      if (!orphan) {
        caseFailures.push('orphan.html section missing');
      } else {
        if (orphan.status === 'broken') {
          caseFailures.push(`orphan.html should not be broken (got ${orphan.status})`);
        }
      }
    }, failures);

    if (failures.length) {
      console.error('[review-docs-test] Failures found:');
      for (const f of failures) console.error(' -', f);
      process.exit(1);
    }

    console.log('[review-docs-test] all checks passed');
  } finally {
    clearTimeout(timer);
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

testReviewDocs().catch((err) => {
  console.error(err);
  process.exit(1);
});
