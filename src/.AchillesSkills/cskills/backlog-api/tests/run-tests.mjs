import fs from 'node:fs/promises';
import path from 'node:path';

const testsRaw = await fs.readFile(path.join(process.cwd(), "test-cases.json"), 'utf-8');
const { tests } = JSON.parse(testsRaw);
const modulePath = "../src/index.mjs";

let action;
try {
  const module = await import(modulePath);
  action = module.action;
} catch (e) {
  const results = [{
    name: 'Module Import',
    pass: false,
    actual: `Failed to import module from ${modulePath}: ${e.message}`,
    expectedOutput: 'Module to be imported successfully'
  }];
  process.stdout.write(JSON.stringify({ results }));
  process.exit(0);
}


if (typeof action !== 'function') {
  const results = [{
    name: 'Action Export Test',
    pass: false,
    actual: 'Module does not export an `action` function.',
    expectedOutput: 'An `action` function to be exported'
  }];
  process.stdout.write(JSON.stringify({ results }));
  process.exit(0);
}

const results = [];
for (const test of tests) {
  let actual;
  try {
    actual = await action(test.input);
  } catch (error) {
    actual = error?.message || String(error);
  }

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
