import fs from 'node:fs/promises';
import path from 'node:path';

const testsRaw = await fs.readFile(path.join(process.cwd(), 'test-cases.json'), 'utf-8');
const { tests } = JSON.parse(testsRaw);

const prompts = await import('../src/prompts.mjs');

if (typeof prompts.askLLMForFiles !== 'function' || typeof prompts.buildConstraintsSection !== 'function') {
  throw new Error('Expected exports askLLMForFiles and buildConstraintsSection were not found.');
}

const results = [];

for (const test of tests) {
  let actual;

  try {
    const input = test.input || {};

    if (input.api === 'buildConstraintsSection') {
      actual = prompts.buildConstraintsSection(input.options);
    } else if (input.api === 'askLLMForFiles') {
      const llmAgent = {
        executePrompt: async (prompt, options) => {
          if (input.mockMode === 'validate') {
            let ok = true;

            if (input.requireOptionsExact) {
              ok = ok && JSON.stringify(options) === JSON.stringify({ mode: 'fast', responseShape: 'json' });
            }

            if (Array.isArray(input.requiredPromptIncludes)) {
              for (const snippet of input.requiredPromptIncludes) {
                if (!prompt.includes(snippet)) {
                  ok = false;
                  break;
                }
              }
            }

            if (Array.isArray(input.requiredPromptExcludes)) {
              for (const snippet of input.requiredPromptExcludes) {
                if (prompt.includes(snippet)) {
                  ok = false;
                  break;
                }
              }
            }

            return ok ? input.responseOnMatch : input.responseOnMismatch;
          }

          return input.mockResponse;
        }
      };

      actual = await prompts.askLLMForFiles(
        llmAgent,
        input.userRequest,
        input.directoryTree,
        input.currentContext,
        input.constraints
      );
    } else {
      throw new Error(`Unknown api target: ${input.api}`);
    }
  } catch (error) {
    actual = error?.message || String(error);
  }

  const pass = JSON.stringify(actual) === JSON.stringify(test.expectedOutput);
  results.push({
    name: test.name,
    input: test.input,
    expectedOutput: test.expectedOutput,
    actual,
    pass
  });
}

process.stdout.write(JSON.stringify({ results }));