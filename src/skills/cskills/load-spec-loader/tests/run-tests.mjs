import fs from 'node:fs/promises';
import path from 'node:path';

const testsRaw = await fs.readFile(path.join(process.cwd(), "test-cases.json"), 'utf-8');
const { tests } = JSON.parse(testsRaw);
const modulePath = "../src/index.mjs";
const { action } = await import(modulePath);

if (typeof action !== 'function') {
  throw new Error('Generated module does not export an action function.');
}

const results = [];
for (const test of tests) {
  let actual;
  let pass = false;
  try {
    // The action function takes no arguments.
    actual = await action();
    // The test framework requires JSON stringification for a consistent comparison,
    // even for primitive types like strings.
    pass = JSON.stringify(actual) === JSON.stringify(test.expectedOutput);
  } catch (error) {
    actual = { error: error?.message || String(error) };
    pass = false;
  }
  results.push({
    name: test.name,
    input: test.input,
    expectedOutput: test.expectedOutput,
    actual,
    pass,
  });
}

process.stdout.write(JSON.stringify({ results }));
