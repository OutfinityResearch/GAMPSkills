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
  const mockLlmAgent = {
    executePrompt: async (prompt, options) => {
      // This mock simulates the LLM returning a specific JSON string response for the test
      return Promise.resolve(test.llmResponse);
    }
  };

  let actual;
  try {
    actual = await action({ 
      llmAgent: mockLlmAgent,
      promptText: test.input 
    });
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
