import { askLLMForFiles, buildConstraintsSection } from '../src/prompts.mjs';

const results = [];

function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function record(expected, actual) {
  results.push({
    expected,
    actual,
    pass: isEqual(expected, actual),
  });
}

function createFakeAgent(responseOrFn) {
  const calls = [];
  return {
    calls,
    async executePrompt(prompt, options) {
      calls.push({ prompt, options });
      if (typeof responseOrFn === 'function') {
        return responseOrFn({ prompt, options, calls });
      }
      return responseOrFn;
    },
  };
}

try {
  // (7) buildConstraintsSection emits only active lines and empty when none active.
  const activeOptions = {
    filter: '\\.(mjs|js)$',
    exclude: '\\.test\\.mjs$',
    maxFiles: 5,
    include: ['src/index.mjs', 'README.md'],
    dir: 'src',
  };

  const expectedActiveConstraints =
    '\n## Active Constraints\n' +
    '- ONLY select files whose name matches the pattern: \\.(mjs|js)$\n' +
    '- Do NOT select files whose name matches the pattern: \\.test\\.mjs$\n' +
    '- Maximum 5 files can be read in total. Be selective.\n' +
    '- The following files are already force-included and loaded. Do NOT request them again: src/index.mjs, README.md\n' +
    '- Only select files within the directory: src\n';

  const activeConstraints = buildConstraintsSection(activeOptions);
  record(expectedActiveConstraints, activeConstraints);

  const inactiveOptions = {
    filter: '',
    exclude: '',
    maxFiles: null,
    include: [],
    dir: '.',
  };
  record('', buildConstraintsSection(inactiveOptions));

  // (1), (3), (4) Initial prompt + exact executePrompt options + object normalization.
  const userRequest1 = 'Find where configuration is loaded.';
  const directoryTree1 = 'src/index.mjs\nsrc/config.mjs\npackage.json';
  const agent1 = createFakeAgent({
    done: 'yes',
    files: ['src/index.mjs', '', '   ', 0, 'README.md'],
    reason: 123,
  });

  const result1 = await askLLMForFiles(
    agent1,
    userRequest1,
    directoryTree1,
    null,
    activeConstraints
  );

  const prompt1 = agent1.calls[0]?.prompt || '';
  record(
    {
      hasRequestHeader: true,
      includesUserRequest: true,
      includesDirectory: true,
      includesConstraints: true,
      hasInitialRoleText: true,
      omitsLoadedContextSection: true,
    },
    {
      hasRequestHeader: prompt1.includes('## Request'),
      includesUserRequest: prompt1.includes(userRequest1),
      includesDirectory: prompt1.includes(directoryTree1),
      includesConstraints: prompt1.includes(activeConstraints.trim()),
      hasInitialRoleText: prompt1.includes('Your job is to determine which files from a project should be read'),
      omitsLoadedContextSection: !prompt1.includes('## Already Loaded Context'),
    }
  );

  record({ mode: 'fast', responseShape: 'json' }, agent1.calls[0]?.options || null);

  record(
    { done: true, files: ['src/index.mjs', 'README.md'], reason: '' },
    result1
  );

  // (2) Follow-up call includes already-loaded context section.
  const currentContext = 'File: src/index.mjs\nContent: import config from "./config.mjs";';
  const agent2 = createFakeAgent({ done: false, files: ['src/config.mjs'], reason: 'Need dependency details.' });

  await askLLMForFiles(
    agent2,
    'Trace config usage',
    directoryTree1,
    currentContext,
    ''
  );

  const prompt2 = agent2.calls[0]?.prompt || '';
  record(
    {
      hasOriginalRequestHeader: true,
      hasLoadedContextHeader: true,
      includesCurrentContext: true,
      hasFollowUpRoleText: true,
    },
    {
      hasOriginalRequestHeader: prompt2.includes('## Original Request'),
      hasLoadedContextHeader: prompt2.includes('## Already Loaded Context'),
      includesCurrentContext: prompt2.includes(currentContext),
      hasFollowUpRoleText: prompt2.includes('You have already read some files and need to decide if more files are needed.'),
    }
  );

  // (5) String response with surrounding text still parses embedded JSON.
  const agent3 = createFakeAgent(
    'Some surrounding text\n{"done":0,"files":["src/config.mjs","","   "],"reason":"Need config file"}\nMore text'
  );

  const result3 = await askLLMForFiles(
    agent3,
    'Need config',
    directoryTree1,
    null,
    ''
  );

  record(
    { done: false, files: ['src/config.mjs'], reason: 'Need config file' },
    result3
  );

  // (6) Malformed string response triggers fallback.
  const agent4 = createFakeAgent('prefix {"done": tru, "files": []} suffix');
  const result4 = await askLLMForFiles(
    agent4,
    'Anything',
    directoryTree1,
    null,
    ''
  );

  record(
    { done: true, files: [], reason: 'Could not parse LLM response.' },
    result4
  );
} catch (e) {
  record('no throw', `threw: ${e && e.message ? e.message : String(e)}`);
}

process.stdout.write(JSON.stringify({ results }));
