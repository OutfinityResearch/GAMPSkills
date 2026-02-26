import { parseInput, applyDefaults, buildDefaults } from '../src/parser.mjs';

const results = [];

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = normalize(value[key]);
    return out;
  }
  return value;
}

function deepEqual(a, b) {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}

function pushResult(expected, actual, pass) {
  results.push({ expected, actual, pass: Boolean(pass) });
}

const canonicalDefaults = {
  dir: '.',
  filter: null,
  maxDepth: 2,
  exclude: null,
  maxFiles: null,
  maxFileSize: null,
  include: null,
};

// (1) no options section: parseInput should return trimmed prompt and full defaults
{
  const input = '   Analyze this project structure   ';
  const out = parseInput(input);
  const expected = {
    case: 'no-options-section',
    prompt: 'Analyze this project structure',
    options: canonicalDefaults,
    optionsRaw: '',
    parseError: null,
  };
  const actual = {
    case: 'no-options-section',
    prompt: out.prompt,
    options: out.options,
    optionsRaw: out.optionsRaw,
    parseError: out.parseError,
  };
  pushResult(expected, actual, deepEqual(expected, actual));
}

// (2) null/non-string input: empty prompt with defaults
{
  const inputs = [null, undefined, 0, 42, true, false, {}, [], Symbol('x')];
  const actual = inputs.map((value) => {
    const out = parseInput(value);
    return {
      prompt: out.prompt,
      options: out.options,
      optionsRaw: out.optionsRaw,
      parseError: out.parseError,
    };
  });
  const expected = inputs.map(() => ({
    prompt: '',
    options: canonicalDefaults,
    optionsRaw: '',
    parseError: null,
  }));
  pushResult(
    { case: 'null-non-string-input-defaulting', expected },
    { case: 'null-non-string-input-defaulting', actual },
    deepEqual(actual, expected)
  );
}

// (3) options parsing success path (mixed values), using real parseInput + parser
let successfulMixedParse = null;
{
  const candidates = [
    {
      raw: 'dir=src filter=*.js maxDepth=3 exclude=node_modules maxFiles=10 maxFileSize=2048 include=foo include=bar',
      expectedOptions: {
        dir: 'src',
        filter: '*.js',
        maxDepth: 3,
        exclude: 'node_modules',
        maxFiles: 10,
        maxFileSize: 2048,
        include: ['foo', 'bar'],
      },
    },
    {
      raw: 'dir:src filter:*.js maxDepth:3 exclude:node_modules maxFiles:10 maxFileSize:2048 include:foo include:bar',
      expectedOptions: {
        dir: 'src',
        filter: '*.js',
        maxDepth: 3,
        exclude: 'node_modules',
        maxFiles: 10,
        maxFileSize: 2048,
        include: ['foo', 'bar'],
      },
    },
    {
      raw: '{"dir":"src","filter":"*.js","maxDepth":3,"exclude":"node_modules","maxFiles":10,"maxFileSize":2048,"include":["foo","bar"]}',
      expectedOptions: {
        dir: 'src',
        filter: '*.js',
        maxDepth: 3,
        exclude: 'node_modules',
        maxFiles: 10,
        maxFileSize: 2048,
        include: ['foo', 'bar'],
      },
    },
    {
      raw: 'dir=src, filter=*.js, maxDepth=3, exclude=node_modules, maxFiles=10, maxFileSize=2048, include=foo, include=bar',
      expectedOptions: {
        dir: 'src',
        filter: '*.js',
        maxDepth: 3,
        exclude: 'node_modules',
        maxFiles: 10,
        maxFileSize: 2048,
        include: ['foo', 'bar'],
      },
    },
  ];

  for (const candidate of candidates) {
    const out = parseInput(`Prompt for parsing options: ${candidate.raw}`);
    if (
      out.parseError === null &&
      out.prompt === 'Prompt for parsing' &&
      out.optionsRaw === candidate.raw &&
      deepEqual(out.options, candidate.expectedOptions)
    ) {
      successfulMixedParse = { ...candidate, out };
      break;
    }
  }

  pushResult(
    {
      case: 'mixed-options-parse-success',
      foundWorkingSyntax: true,
      expectedPrompt: 'Prompt for parsing',
      expectedOptions: successfulMixedParse ? successfulMixedParse.expectedOptions : null,
    },
    {
      case: 'mixed-options-parse-success',
      foundWorkingSyntax: Boolean(successfulMixedParse),
      prompt: successfulMixedParse?.out.prompt ?? null,
      options: successfulMixedParse?.out.options ?? null,
      optionsRaw: successfulMixedParse?.out.optionsRaw ?? null,
      parseErrorIsNull: successfulMixedParse ? successfulMixedParse.out.parseError === null : false,
    },
    Boolean(successfulMixedParse)
  );
}

// (3 continued) applyDefaults coercion/validation: positive finite numbers only, trimmed strings, comma include
{
  const parsed = {
    dir: '   src/app   ',
    filter: '   *.mjs   ',
    maxDepth: '0',
    exclude: '   node_modules   ',
    maxFiles: '-2',
    maxFileSize: 'Infinity',
    include: ' a, b ,,  c  ',
  };
  const out = applyDefaults(parsed);
  const expected = {
    dir: 'src/app',
    filter: '*.mjs',
    maxDepth: 2,
    exclude: 'node_modules',
    maxFiles: null,
    maxFileSize: null,
    include: ['a', 'b', 'c'],
  };
  pushResult(
    { case: 'applyDefaults-coercion-validation-comma-include', options: expected },
    { case: 'applyDefaults-coercion-validation-comma-include', options: out },
    deepEqual(expected, out)
  );
}

// (3 continued) include supports repeated-key style arrays
{
  const parsed = {
    include: [' one ', '', 'two', '   ', 123, 'three'],
  };
  const out = applyDefaults(parsed);
  const expected = {
    dir: '.',
    filter: null,
    maxDepth: 2,
    exclude: null,
    maxFiles: null,
    maxFileSize: null,
    include: [' one ', 'two', 'three'],
  };
  pushResult(
    { case: 'applyDefaults-include-array-support', options: expected },
    { case: 'applyDefaults-include-array-support', options: out },
    deepEqual(expected, out)
  );
}

// (4) invalid/unknown option syntax -> parseError + defaults, preserving prompt/optionsRaw
{
  const invalidRaws = [
    'unknownKey=1',
    '???',
    '{"unknownKey":1}',
    'dir=src badToken',
  ];

  let invalidHit = null;
  for (const raw of invalidRaws) {
    const out = parseInput(`Bad prompt text options: ${raw}`);
    if (out.parseError !== null) {
      invalidHit = { raw, out };
      break;
    }
  }

  const pass = Boolean(
    invalidHit &&
      invalidHit.out.prompt === 'Bad prompt text' &&
      invalidHit.out.optionsRaw === invalidHit.raw &&
      deepEqual(invalidHit.out.options, canonicalDefaults)
  );

  pushResult(
    {
      case: 'invalid-options-parse-error-defaults-preserved-raw',
      parseErrorPresent: true,
      prompt: 'Bad prompt text',
      optionsRaw: invalidHit ? invalidHit.raw : null,
      options: canonicalDefaults,
    },
    {
      case: 'invalid-options-parse-error-defaults-preserved-raw',
      parseErrorPresent: invalidHit ? invalidHit.out.parseError !== null : false,
      prompt: invalidHit?.out.prompt ?? null,
      optionsRaw: invalidHit?.out.optionsRaw ?? null,
      options: invalidHit?.out.options ?? null,
    },
    pass
  );
}

// (5) options marker matching is case-insensitive and split point is correct
{
  const input = '  The word options appears here but not as marker.   OpTiOnS : dir=src  ';
  const out = parseInput(input);
  const expected = {
    case: 'marker-case-insensitive-and-split-point',
    prompt: 'The word options appears here but not as marker.',
    optionsRaw: 'dir=src',
  };
  const actual = {
    case: 'marker-case-insensitive-and-split-point',
    prompt: out.prompt,
    optionsRaw: out.optionsRaw,
  };
  pushResult(expected, actual, deepEqual(expected, actual));
}

// (6) buildDefaults returns canonical baseline object
{
  const out = buildDefaults();
  const expected = canonicalDefaults;
  pushResult(
    { case: 'buildDefaults-canonical-baseline', defaults: expected },
    { case: 'buildDefaults-canonical-baseline', defaults: out },
    deepEqual(expected, out)
  );
}

process.stdout.write(JSON.stringify({ results }));
