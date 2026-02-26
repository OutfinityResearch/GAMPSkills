import { resolve } from 'path';
import { action } from '../src/index.mjs';

const results = [];

function pushResult(expected, actual, pass) {
  results.push({ expected, actual, pass: Boolean(pass) });
}

function extractAssignedPaths(contextText) {
  const paths = [];
  const regex = /assign\s+"([^"]+)"/g;
  let match;
  while ((match = regex.exec(contextText)) !== null) {
    paths.push(match[1]);
  }
  return paths;
}

function createQueuedAgent(responsesOrFactory) {
  const prompts = [];
  let callCount = 0;

  return {
    prompts,
    get callCount() {
      return callCount;
    },
    async executePrompt(prompt, opts) {
      callCount += 1;
      prompts.push(prompt);

      if (typeof responsesOrFactory === 'function') {
        return responsesOrFactory({ prompt, opts, callCount });
      }

      const idx = Math.min(callCount - 1, responsesOrFactory.length - 1);
      return responsesOrFactory[idx] ?? { done: true, files: [], reason: 'default' };
    },
  };
}

const repoCwd = process.cwd();
const fixtureDir = resolve(repoCwd, 'tests/fixtures/action-project');

async function run() {
  // Case 1: happy path multi-iteration and follow-up prompt gets accumulated context
  try {
    process.chdir(fixtureDir);
    const llmAgent = createQueuedAgent([
      { done: false, files: ['src/main.js'], reason: 'Need main file first' },
      { done: true, files: [], reason: 'Enough context' },
    ]);

    const output = await action({ llmAgent, promptText: 'Explain the main flow' });

    const hasMainPath = output.includes('"src/main.js"');
    const hasMainContent = output.includes('MAIN_FILE_MARKER');
    const secondPromptHasLoadedContext =
      llmAgent.prompts.length >= 2 &&
      llmAgent.prompts[1].includes('## Already Loaded Context') &&
      llmAgent.prompts[1].includes('src/main.js') &&
      llmAgent.prompts[1].includes('MAIN_FILE_MARKER');

    pushResult(true, hasMainPath && hasMainContent, hasMainPath && hasMainContent);
    pushResult(true, llmAgent.prompts.length === 2, llmAgent.prompts.length === 2);
    pushResult(true, secondPromptHasLoadedContext, secondPromptHasLoadedContext);

    const firstPromptHasProjectFiles =
      llmAgent.prompts[0].includes('src/main.js') && llmAgent.prompts[0].includes('docs/readme.md');
    const firstPromptExcludesNodeModules = !llmAgent.prompts[0].includes('node_modules/pkg.js');
    pushResult(true, firstPromptHasProjectFiles && firstPromptExcludesNodeModules, firstPromptHasProjectFiles && firstPromptExcludesNodeModules);
  } catch (e) {
    pushResult('case 1 succeeds', String(e && e.message), false);
  } finally {
    process.chdir(repoCwd);
  }

  // Case 2: include option force-read before LLM loop
  try {
    process.chdir(fixtureDir);
    const llmAgent = createQueuedAgent([
      { done: true, files: [], reason: 'No additional files needed' },
    ]);

    const output = await action({
      llmAgent,
      promptText: 'Use pinned context options: {"include":"include/pinned.txt"}',
    });

    const hasPinnedPath = output.includes('"include/pinned.txt"');
    const hasPinnedContent = output.includes('PINNED_FILE_MARKER');
    pushResult(true, hasPinnedPath && hasPinnedContent, hasPinnedPath && hasPinnedContent);

    const constraintsMentionInclude = llmAgent.prompts[0].includes('force-included') && llmAgent.prompts[0].includes('include/pinned.txt');
    pushResult(true, constraintsMentionInclude, constraintsMentionInclude);
  } catch (e) {
    pushResult('case 2 succeeds', String(e && e.message), false);
  } finally {
    process.chdir(repoCwd);
  }

  // Case 3: malformed options parse error falls back to defaults but still processes prompt
  try {
    process.chdir(fixtureDir);
    const llmAgent = createQueuedAgent([
      { done: false, files: ['src/helper.js'], reason: 'Need helper' },
      { done: true, files: [], reason: 'done' },
    ]);

    const output = await action({
      llmAgent,
      promptText: 'Explain helper behavior options: {not-valid-json',
    });

    const hasHelper = output.includes('"src/helper.js"') && output.includes('HELPER_FILE_MARKER');
    pushResult(true, hasHelper, hasHelper);

    const firstPromptHasOriginalPrompt = llmAgent.prompts[0].includes('Explain helper behavior');
    const firstPromptHasNoConstraintsSection = !llmAgent.prompts[0].includes('## Active Constraints');
    pushResult(true, firstPromptHasOriginalPrompt && firstPromptHasNoConstraintsSection, firstPromptHasOriginalPrompt && firstPromptHasNoConstraintsSection);
  } catch (e) {
    pushResult('case 3 succeeds', String(e && e.message), false);
  } finally {
    process.chdir(repoCwd);
  }

  // Case 4: maxFiles enforcement
  try {
    process.chdir(fixtureDir);
    const llmAgent = createQueuedAgent([
      { done: false, files: ['src/main.js', 'src/helper.js'], reason: 'Need both maybe' },
      { done: false, files: ['docs/readme.md'], reason: 'Need docs too' },
      { done: false, files: ['include/pinned.txt'], reason: 'would request more if allowed' },
    ]);

    const output = await action({
      llmAgent,
      promptText: 'Cap files options: {"maxFiles":1}',
    });

    const assigned = extractAssignedPaths(output);
    const onlyOneFileRead = assigned.length === 1;
    const firstRequestedRead = assigned[0] === 'src/main.js';
    pushResult(true, onlyOneFileRead && firstRequestedRead, onlyOneFileRead && firstRequestedRead);

    const llmCallsBoundedAfterCap = llmAgent.callCount === 2;
    pushResult(true, llmCallsBoundedAfterCap, llmCallsBoundedAfterCap);
  } catch (e) {
    pushResult('case 4 succeeds', String(e && e.message), false);
  } finally {
    process.chdir(repoCwd);
  }

  // Case 5: maxFileSize skip marker
  try {
    process.chdir(fixtureDir);
    const llmAgent = createQueuedAgent([
      { done: false, files: ['oversized.bin'], reason: 'Try to read oversized' },
      { done: true, files: [], reason: 'done' },
    ]);

    const output = await action({
      llmAgent,
      promptText: 'Handle big files options: {"maxFileSize":50}',
    });

    const hasOversizedPath = output.includes('"oversized.bin"');
    const hasSkipMarker = output.includes('[Skipped: file size') && output.includes('exceeds maxFileSize 50');
    pushResult(true, hasOversizedPath && hasSkipMarker, hasOversizedPath && hasSkipMarker);
  } catch (e) {
    pushResult('case 5 succeeds', String(e && e.message), false);
  } finally {
    process.chdir(repoCwd);
  }

  // Case 6: empty/invalid prompt input throws expected error
  try {
    process.chdir(fixtureDir);
    const llmAgent = createQueuedAgent([{ done: true, files: [], reason: 'unused' }]);

    let threw = false;
    let message = '';
    try {
      await action({ llmAgent, promptText: '' });
    } catch (e) {
      threw = true;
      message = String(e && e.message);
    }

    const pass = threw && message === 'No input provided for context-loader.';
    pushResult('No input provided for context-loader.', message || '(no error)', pass);
  } catch (e) {
    pushResult('case 6 succeeds', String(e && e.message), false);
  } finally {
    process.chdir(repoCwd);
  }

  // Case 7: iteration safety cap bounds loop when done=false forever
  try {
    process.chdir(fixtureDir);
    const llmAgent = createQueuedAgent(() => ({ done: false, files: [], reason: 'keep going' }));

    const output = await action({
      llmAgent,
      promptText: 'Never done scenario',
    });

    const boundedCalls = llmAgent.callCount === 6; // initial + 5 loop iterations
    const returnsWithoutContext = output === '';
    pushResult(6, llmAgent.callCount, boundedCalls);
    pushResult('', output, returnsWithoutContext);
  } catch (e) {
    pushResult('case 7 succeeds', String(e && e.message), false);
  } finally {
    process.chdir(repoCwd);
  }

  process.stdout.write(JSON.stringify({ results }));
}

run();
