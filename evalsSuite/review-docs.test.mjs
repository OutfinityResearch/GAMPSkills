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
  return result?.result ?? result;
}

function parseBacklog(content) {
  const tasks = [];
  const lines = (content || '').split(/\r?\n/);
  let current = null;
  let collectingDescription = false;
  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(\d+)\s*$/);
    if (headerMatch) {
      current = {
        id: headerMatch[1],
        status: null,
        description: ''
      };
      tasks.push(current);
      collectingDescription = false;
      continue;
    }
    if (!current) continue;
    if (line.startsWith('**Description:**')) {
      current.description = line.replace('**Description:**', '').trim();
      collectingDescription = true;
      continue;
    }
    if (line.startsWith('**Status:**')) {
      current.status = line.replace('**Status:**', '').trim().toLowerCase();
      collectingDescription = false;
      continue;
    }
    if (line.startsWith('**Options:**') || line.startsWith('**Resolution:**')) {
      collectingDescription = false;
      continue;
    }
    if (collectingDescription && line.trim()) {
      current.description = `${current.description} ${line.trim()}`.trim();
    }
  }
  return tasks;
}

function findTaskByDescription(tasks, pattern) {
  return tasks.find((task) => pattern.test(task.description));
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

      const tasks = parseBacklog(backlog);

      const complete = findTaskByDescription(tasks, /complete\.html/i);
      if (!complete) {
        caseFailures.push('complete.html section missing');
      } else if (complete.status !== 'ok') {
        caseFailures.push(`complete.html should be ok (got ${complete.status})`);
      }

      const vague = findTaskByDescription(tasks, /vague\.html/i);
      if (!vague) {
        caseFailures.push('vague.html section missing');
      } else {
        if (vague.status === 'ok') {
          caseFailures.push(`vague.html status should not be ok (got ${vague.status})`);
        }
        expectRegex('vague description', vague.description, /missing|unclear|vague|detail/i, caseFailures);
      }

      const inconsistent = findTaskByDescription(tasks, /inconsistent\.html/i);
      if (!inconsistent) {
        caseFailures.push('inconsistent.html section missing');
      } else {
        if (inconsistent.status === 'ok') {
          caseFailures.push(`inconsistent.html should not be ok (got ${inconsistent.status})`);
        }
        expectRegex(
          'inconsistent description',
          inconsistent.description,
          /(inconsisten|mismatch|contradic|purpose|terminolog|missing purpose|missing usage|no examples)/i,
          caseFailures
        );
      }

      const broken = findTaskByDescription(tasks, /broken\.html/i);
      if (!broken) {
        caseFailures.push('broken.html section missing');
      } else {
        if (broken.status === 'ok') {
          caseFailures.push(`broken.html should not be ok (got ${broken.status})`);
        }
        expectRegex(
          'broken description',
          broken.description,
          /(structur|missing|incomplete|no examples|unclear|broken)/i,
          caseFailures
        );
      }

      const orphan = findTaskByDescription(tasks, /orphan\.html/i);
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
