import fs from 'node:fs/promises';
import path from 'node:path';

const testDir = './temp-fs-test-data';

// Note: The expectedOutput in test-cases.json uses absolute paths like
// '/usr/src/app/temp-fs-test-data/file1.txt'. The test runner executes
// from '/usr/src/app', so path.resolve() in the module will produce matching paths.

async function run() {
  try {
    // Setup: Ensure the test directory is clean before starting.
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(testDir, { recursive: true });

    const testsRaw = await fs.readFile(path.join(process.cwd(), 'test-cases.json'), 'utf-8');
    const { tests } = JSON.parse(testsRaw);
    const modulePath = '../src/index.mjs';
    const { action } = await import(modulePath);

    if (typeof action !== 'function') {
      throw new Error('Generated module does not export an action function.');
    }

    const results = [];
    for (const test of tests) {
      let actual;
      try {
        // The spec requires an llmAgent property, but it's not needed for these positive test cases.
        actual = await action({ llmAgent: null, promptText: test.input });
      } catch (error) {
        actual = error?.message || String(error);
      }

      // For readFile, we need to resolve the path in the expected output to match the runtime environment
      const pass = JSON.stringify(actual) === JSON.stringify(test.expectedOutput);

      results.push({
        name: test.name,
        input: test.input,
        expectedOutput: test.expectedOutput,
        actual,
        pass,
      });
    }

    process.stdout.write(JSON.stringify({ results }));
  } finally {
    // Teardown: Clean up the temp directory after tests are done.
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
  }
}

run();
