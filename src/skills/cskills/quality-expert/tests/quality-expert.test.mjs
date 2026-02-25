import { readFile as readFileFs } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(__dirname, '../src/index.mjs');

const DS_CONTENT = 'DS PROFILE CONTENT';
const FDS_CONTENT = 'FDS PROFILE CONTENT';

let readFileCalls = [];
const readFileMock = async (path, encoding) => {
  readFileCalls.push({ path: String(path), encoding });
  if (String(path).includes('DS_structure')) return DS_CONTENT;
  if (String(path).includes('FDS_structure')) return FDS_CONTENT;
  return '';
};

let stripDependsOnCalls = [];
let stripDependsOnImpl = text => text;
const stripDependsOnMock = text => {
  stripDependsOnCalls.push(text);
  return stripDependsOnImpl(text);
};

async function wrapModule(specifier, context) {
  const ns = await import(specifier);
  const exportNames = Object.keys(ns);
  return new vm.SyntheticModule(exportNames, function () {
    for (const name of exportNames) {
      this.setExport(name, ns[name]);
    }
  }, { context });
}

async function loadModule() {
  const source = await readFileFs(srcPath, 'utf8');
  const augmented = `${source}\nexport { getProfilePrompt, parseInput, buildReviewPrompt, executeQualityReview };`;
  const context = vm.createContext({ console, process, Buffer, setTimeout, clearTimeout });
  const module = new vm.SourceTextModule(augmented, {
    context,
    identifier: srcPath,
    initializeImportMeta(meta) {
      meta.url = pathToFileURL(srcPath).href;
    }
  });
  await module.link(async specifier => {
    if (specifier === 'node:fs/promises') {
      return new vm.SyntheticModule(['readFile'], function () {
        this.setExport('readFile', readFileMock);
      }, { context });
    }
    if (specifier === '../../../../utils/ArgumentResolver.mjs') {
      return new vm.SyntheticModule(['stripDependsOn'], function () {
        this.setExport('stripDependsOn', stripDependsOnMock);
      }, { context });
    }
    return await wrapModule(specifier, context);
  });
  await module.evaluate();
  return module.namespace;
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const results = [];
function record(expected, actual) {
  results.push({ expected, actual, pass: deepEqual(expected, actual) });
}

async function recordError(fn, expectedMessage) {
  try {
    await fn();
    record(expectedMessage, 'no error');
  } catch (err) {
    record(expectedMessage, err && err.message ? err.message : String(err));
  }
}

const ns = await loadModule();
const { getProfilePrompt, parseInput, buildReviewPrompt, executeQualityReview, action } = ns;

// getProfilePrompt tests
record(DS_CONTENT, getProfilePrompt('  ds '));
record(FDS_CONTENT, getProfilePrompt('FDS'));
await recordError(() => getProfilePrompt('docs'), 'quality-expert: Unsupported profile "docs" (TBD).');
await recordError(() => getProfilePrompt('code'), 'quality-expert: Unsupported profile "code" (TBD).');
await recordError(() => getProfilePrompt('unknown'), 'quality-expert: Unknown profile "unknown".');

// parseInput tests
const parsed = parseInput('fileContent:  hello world  \n profile:  ds \n context:  ctx value  ');
record({ fileContent: 'hello world', profile: 'ds', context: 'ctx value' }, parsed);
await recordError(() => parseInput('   '), 'quality-expert: Missing input string.');
await recordError(() => parseInput('fileContent: x profile: ds'), 'quality-expert: Invalid input format. Expected: fileContent: ... profile: ... context: ...');
await recordError(() => parseInput('fileContent:   profile: ds context: c'), 'quality-expert: Missing required parameter fileContent.');
await recordError(() => parseInput('fileContent: x profile:   context: c'), 'quality-expert: Missing required parameter profile.');

// buildReviewPrompt tests
const brp = buildReviewPrompt({ fileContent: 'FC', profile: 'ds', context: 'CTX' });
record(true, brp.includes(DS_CONTENT) && brp.includes('File content:\nFC') && brp.includes('Context:\nCTX'));
await recordError(() => buildReviewPrompt({ fileContent: 'x', profile: 'docs', context: 'c' }), 'quality-expert: Unsupported profile "docs" (TBD).');

// executeQualityReview tests
{
  let captured = {};
  const llmAgent = {
    executePrompt: async (prompt, options) => {
      captured = { prompt, options };
      return JSON.stringify({ content: 'updated content' });
    }
  };
  const fileContent = 'original content';
  const context = 'ctx';
  const promptText = `fileContent: ${fileContent}\nprofile: ds\ncontext: ${context}`;
  const result = await executeQualityReview({ prompt: promptText, llmAgent });
  record('updated content', result);
  record({ mode: 'deep' }, captured.options);
  const expectedPrompt = buildReviewPrompt({ fileContent, profile: 'ds', context });
  record(expectedPrompt, captured.prompt);
}

await recordError(async () => {
  const llmAgent = { executePrompt: async () => 42 };
  await executeQualityReview({ prompt: 'fileContent: x\nprofile: ds\ncontext: c', llmAgent });
}, 'quality-expert: LLM response must be a non-empty string.');

await recordError(async () => {
  const llmAgent = { executePrompt: async () => '' };
  await executeQualityReview({ prompt: 'fileContent: x\nprofile: ds\ncontext: c', llmAgent });
}, 'quality-expert: LLM response must be a non-empty string.');

await recordError(async () => {
  const llmAgent = { executePrompt: async () => 'not json' };
  await executeQualityReview({ prompt: 'fileContent: x\nprofile: ds\ncontext: c', llmAgent });
}, 'quality-expert: LLM response is not valid JSON. Error: Unexpected token o in JSON at position 1');

await recordError(async () => {
  const llmAgent = { executePrompt: async () => '{}' };
  await executeQualityReview({ prompt: 'fileContent: x\nprofile: ds\ncontext: c', llmAgent });
}, 'quality-expert: LLM JSON response must include a "content" field of type string.');

{
  const llmAgent = { executePrompt: async () => JSON.stringify({ content: '' }) };
  const promptText = 'fileContent: keep\nprofile: ds\ncontext: c';
  const result = await executeQualityReview({ prompt: promptText, llmAgent });
  record('keep', result);
}

{
  const llmAgent = { executePrompt: async () => JSON.stringify({ content: 'new' }) };
  const promptText = 'fileContent: old\nprofile: ds\ncontext: c';
  const result = await executeQualityReview({ prompt: promptText, llmAgent });
  record('new', result);
}

// action tests
await recordError(async () => {
  await action({ promptText: 'x' });
}, "quality-expert: Missing required 'llmAgent' or 'promptText' in context.");

await recordError(async () => {
  await action({ llmAgent: {} });
}, "quality-expert: Missing required 'llmAgent' or 'promptText' in context.");

{
  stripDependsOnCalls = [];
  stripDependsOnImpl = () => 'fileContent: sanitized content\nprofile: ds\ncontext: ctx';
  let capturedPrompt = '';
  const llmAgent = {
    executePrompt: async (prompt) => {
      capturedPrompt = prompt;
      return JSON.stringify({ content: '' });
    }
  };
  const result = await action({ llmAgent, promptText: 'RAW PROMPT' });
  record('sanitized content', result);
  record(['RAW PROMPT'], stripDependsOnCalls);
  record(true, capturedPrompt.includes('sanitized content'));
}

{
  stripDependsOnCalls = [];
  stripDependsOnImpl = text => text;
  let capturedPrompt = '';
  const llmAgent = {
    executePrompt: async (prompt) => {
      capturedPrompt = prompt;
      return JSON.stringify({ content: 'updated via action' });
    }
  };
  const promptText = 'fileContent: original\nprofile: fds\ncontext: ctx';
  const result = await action({ llmAgent, promptText });
  record('updated via action', result);
  record(true, capturedPrompt.includes(FDS_CONTENT));
}

process.stdout.write(JSON.stringify({ results }));
