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
  // A mock LLM agent whose behavior is determined by the test case.
  const mockLlmAgent = {
    async executePrompt(prompt, options) {
      // For the trimming test, return the expected output with extra whitespace to verify the trim() call.
      if (test.name === "Trims whitespace from LLM response") {
        return `  ${test.expectedOutput} \n`;
      }
      // For all other positive tests, the mock LLM simply returns the final expected string.
      // This simulates a perfect LLM response for the given prompt.
      return test.expectedOutput;
    }
  };

  let actual;
  try {
    // The action requires both `promptText` and `llmAgent` in its context object.
    actual = await action({ 
      promptText: test.input, 
      llmAgent: mockLlmAgent 
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
