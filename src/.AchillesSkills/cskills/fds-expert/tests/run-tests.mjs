import fs from 'node:fs/promises';
import path from 'node:path';

// This mock simulates the behavior of the LLM agent for predictable testing.
// It extracts the user prompt from the full technical prompt and returns a
// consistent, trimmable string that matches the test's expected output.
const mockLlmAgent = {
  async executePrompt(technicalPrompt) {
    const userPromptMatch = technicalPrompt.match(/User Prompt:\s*"""\s*([\s\S]*?)\s*"""/);
    const userPrompt = userPromptMatch ? userPromptMatch[1].trim() : '';

    if (userPrompt.startsWith('Use prompt field')) {
      return '  FDS from prompt field  ';
    }
    if (userPrompt) {
      return `  FDS for ${userPrompt.toLowerCase()}  `;
    }
    // This case should not be hit in these positive tests, but is here for robustness.
    return '  Mock response: No user prompt found.  ';
  },
};

async function runTests() {
  const testsRaw = await fs.readFile(path.join(process.cwd(), 'test-cases.json'), 'utf-8');
  const { tests } = JSON.parse(testsRaw);
  const modulePath = '../src/index.mjs';
  const { action } = await import(modulePath);

  if (typeof action !== 'function') {
    throw new Error('Module does not export an "action" function.');
  }

  const results = [];
  for (const test of tests) {
    let actual;
    try {
      // The action function requires a context object containing an `llmAgent`.
      // We inject our mock agent here.
      const context = { ...test.input, llmAgent: mockLlmAgent };
      actual = await action(context);
    } catch (error) {
      // Positive tests should not throw, but we capture errors for thoroughness.
      actual = { error: error?.message || String(error) };
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
}

runTests();
