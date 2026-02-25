import fs from 'node:fs/promises';
import path from 'node:path';

const testsRaw = await fs.readFile(path.join(process.cwd(), 'test-cases.json'), 'utf-8');
const { tests } = JSON.parse(testsRaw);
const modulePath = '../src/index.mjs';
const mod = await import(modulePath);

if (typeof mod.action !== 'function') {
  throw new Error('Generated module does not export an action function.');
}

function buildBacklogExpertPrompt(userPrompt) {
  const template = `You are a backlog expert. Your job is to generate content that can be written in files of type backlog.
   A backlog is split into tasks, each task has a description, a list of options that represent the possible solutions to that task and a resolution field. 
   The resolution is the approved option that will be used to fulfill that task.
   Your output is written directly into backlog files.

Behaviors:
- If the user asks to generate backlog tasks, output ONLY numbered lines with tasks descriptions (e.g., "1. ...", "2. ...", "3. ...") with no extra prose or headings. In the task description you must mention the exact specs files which would be affected by this task.
- If the user asks to generate options for a task, output ONLY numbered lines (e.g., "1. ...", "2. ...", "3. ...") with no extra prose or headings.
- If the user asks for a resolution or a single update text, respond with a concise plain-text sentence or short paragraph only.
- Do not add commentary, analysis, or headings.

User Prompt:
"""
${userPrompt}
"""`;
  return template;
}

const results = [];
for (const test of tests) {
  const { promptText, llmResponse } = test.input || {};
  const llmAgent = {
    async executePrompt(prompt, options) {
      const expectedPrompt = buildBacklogExpertPrompt(promptText);
      if (prompt !== expectedPrompt) {
        return 'PROMPT_MISMATCH';
      }
      if (!options || options.mode !== 'deep') {
        return 'MODE_MISMATCH';
      }
      return llmResponse;
    },
  };

  let actual;
  try {
    actual = await mod.action({ llmAgent, promptText });
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
