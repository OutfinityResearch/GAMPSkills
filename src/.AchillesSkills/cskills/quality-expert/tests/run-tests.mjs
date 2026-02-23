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
  const { promptText, llmResponse } = test.input;

  const mockLlmAgent = {
    executePrompt: async (prompt, options) => {
      return Promise.resolve(llmResponse);
    }
  };

  let actual;
  let pass;

  try {
    actual = await action({
      llmAgent: mockLlmAgent,
      promptText: promptText
    });
    pass = JSON.stringify(actual) === JSON.stringify(test.expectedOutput);
  } catch (error) {
    actual = error?.message || String(error);
    pass = false; // Any error in a positive test is a failure.
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
