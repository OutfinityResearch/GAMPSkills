import { stat, readFile } from 'fs/promises';
import { resolve } from 'path';
import {
  readRequestedFiles,
  readIncludeFiles,
  buildContextAssignString,
} from '../src/context.mjs';

const results = [];

function record(expected, actual, pass) {
  results.push({ expected, actual, pass: Boolean(pass) });
}

function startsEndsErrorMessage(value) {
  return typeof value === 'string' && value.startsWith('[Error reading file: ') && value.endsWith(']');
}

const repoRoot = process.cwd();
const fixtureRoot = resolve(repoRoot, 'tests/fixtures/context-files');

try {
  // 1) readRequestedFiles resolves relative paths using options.dir
  {
    const map = new Map();
    await readRequestedFiles(['small/a.js'], map, { dir: fixtureRoot });
    record(
      'export const a = 1;\n',
      map.get('small/a.js'),
      map.get('small/a.js') === 'export const a = 1;\n'
    );
  }

  // 2) readRequestedFiles applies filter on basename only
  {
    const map = new Map();
    await readRequestedFiles(['small/a.js', 'small/b.test.js'], map, {
      dir: fixtureRoot,
      filter: '*.test.js',
    });
    const actual = {
      size: map.size,
      hasA: map.has('small/a.js'),
      hasB: map.has('small/b.test.js'),
      bContent: map.get('small/b.test.js'),
    };
    const expected = {
      size: 1,
      hasA: false,
      hasB: true,
      bContent: "describe('b', () => {});\n",
    };
    record(expected, actual, JSON.stringify(expected) === JSON.stringify(actual));
  }

  // 3) readRequestedFiles respects maxFiles cap
  {
    const map = new Map();
    await readRequestedFiles(['small/a.js', 'small/b.test.js'], map, {
      dir: fixtureRoot,
      maxFiles: 1,
    });
    const actual = { size: map.size, keys: [...map.keys()] };
    const expected = { size: 1, keys: ['small/a.js'] };
    record(expected, actual, JSON.stringify(expected) === JSON.stringify(actual));
  }

  // 4) readRequestedFiles skips duplicates already present in map
  {
    const map = new Map([['small/a.js', 'PREEXISTING']]);
    await readRequestedFiles(['small/a.js', 'small/b.test.js'], map, { dir: fixtureRoot });
    const actual = {
      a: map.get('small/a.js'),
      hasB: map.has('small/b.test.js'),
      size: map.size,
    };
    const expected = {
      a: 'PREEXISTING',
      hasB: true,
      size: 2,
    };
    record(expected, actual, JSON.stringify(expected) === JSON.stringify(actual));
  }

  // 5) readRequestedFiles supports absolute paths
  {
    const absPath = resolve(fixtureRoot, 'include/forced.md');
    const map = new Map();
    await readRequestedFiles([absPath], map, { dir: resolve(repoRoot, 'not-used') });
    const actual = map.get(absPath);
    const expected = '# Forced include file\n';
    record(expected, actual, actual === expected);
  }

  // 6) readRequestedFiles enforces maxFileSize with skip message
  {
    const tooBigPath = 'large/too-big.txt';
    const fullTooBig = resolve(fixtureRoot, tooBigPath);
    const s = await stat(fullTooBig);
    const maxFileSize = 40;
    const expectedMessage = `[Skipped: file size ${s.size} bytes exceeds maxFileSize ${maxFileSize}]`;

    const map = new Map();
    await readRequestedFiles([tooBigPath], map, { dir: fixtureRoot, maxFileSize });

    const actualMessage = map.get(tooBigPath);
    record(expectedMessage, actualMessage, actualMessage === expectedMessage);
  }

  // 7) readRequestedFiles stores read errors as formatted message
  {
    const map = new Map();
    const missing = 'missing/not-there.txt';
    await readRequestedFiles([missing], map, { dir: fixtureRoot });
    const actual = map.get(missing);
    record(
      { startsWith: '[Error reading file: ', endsWith: ']' },
      actual,
      startsEndsErrorMessage(actual)
    );
  }

  // 8) readIncludeFiles ignores non-array/null input
  {
    const map = new Map([['x', 'y']]);
    await readIncludeFiles(null, map, { dir: fixtureRoot });
    await readIncludeFiles('include/forced.md', map, { dir: fixtureRoot });
    const actual = { size: map.size, x: map.get('x') };
    const expected = { size: 1, x: 'y' };
    record(expected, actual, JSON.stringify(expected) === JSON.stringify(actual));
  }

  // 9) readIncludeFiles bypasses filter conceptually (filter option is ignored)
  {
    const map = new Map();
    await readIncludeFiles(['include/forced.md'], map, {
      dir: fixtureRoot,
      filter: '*.js',
    });
    const actual = map.get('include/forced.md');
    const expected = '# Forced include file\n';
    record(expected, actual, actual === expected);
  }

  // 10) readIncludeFiles enforces maxFileSize and duplicate protection
  {
    const map = new Map([['include/forced.md', 'KEEP']]);
    const tooBigPath = 'large/too-big.txt';
    const fullTooBig = resolve(fixtureRoot, tooBigPath);
    const s = await stat(fullTooBig);
    const maxFileSize = 40;
    const skip = `[Skipped: file size ${s.size} bytes exceeds maxFileSize ${maxFileSize}]`;

    await readIncludeFiles(['include/forced.md', tooBigPath], map, {
      dir: fixtureRoot,
      maxFileSize,
    });

    const actual = {
      forced: map.get('include/forced.md'),
      tooBig: map.get(tooBigPath),
    };
    const expected = {
      forced: 'KEEP',
      tooBig: skip,
    };
    record(expected, actual, JSON.stringify(expected) === JSON.stringify(actual));
  }

  // 11) buildContextAssignString empty map -> empty string
  {
    const actual = buildContextAssignString(new Map());
    const expected = '';
    record(expected, actual, actual === expected);
  }

  // 12) buildContextAssignString non-empty: structure, sanitized names, relative paths, insertion order
  {
    const oldCwd = process.cwd();
    try {
      process.chdir(resolve(repoRoot, 'tests'));

      const weirdAbs = resolve(repoRoot, 'tests/fixtures/context-files/names/123 weird-name!.txt');
      const aAbs = resolve(repoRoot, 'tests/fixtures/context-files/small/a.js');
      const map = new Map();
      map.set(weirdAbs, 'weird-content');
      map.set(aAbs, 'a-content');

      const out = buildContextAssignString(map);
      const lines = out.split('\n');

      const firstAssignExpected = '@spec_F_123_weird_name assign "fixtures/context-files/names/123 weird-name!.txt"';
      const secondAssignExpected = '@spec_a assign "fixtures/context-files/small/a.js"';

      const firstAssignIndex = lines.indexOf(firstAssignExpected);
      const secondAssignIndex = lines.indexOf(secondAssignExpected);

      const beginCount = lines.filter((l) => l.startsWith('--begin-context-')).length;
      const endCount = lines.filter((l) => l.startsWith('--end-context-')).length;
      const contentAssignCount = lines.filter((l) => l.endsWith('Content assign')).length;

      const actual = {
        hasFirstAssign: firstAssignIndex !== -1,
        hasSecondAssign: secondAssignIndex !== -1,
        insertionOrder: firstAssignIndex !== -1 && secondAssignIndex !== -1 ? firstAssignIndex < secondAssignIndex : false,
        beginCount,
        endCount,
        contentAssignCount,
      };

      const expected = {
        hasFirstAssign: true,
        hasSecondAssign: true,
        insertionOrder: true,
        beginCount: 2,
        endCount: 2,
        contentAssignCount: 2,
      };

      record(expected, actual, JSON.stringify(expected) === JSON.stringify(actual));
    } finally {
      process.chdir(oldCwd);
    }
  }

  // 13) buildContextAssignString heredoc token does not collide with content markers
  {
    const oldCwd = process.cwd();
    try {
      process.chdir(resolve(repoRoot, 'tests'));
      const conflictAbs = resolve(repoRoot, 'tests/fixtures/context-files/tokens/conflict.txt');
      const conflictContent = await readFile(conflictAbs, 'utf8');
      const map = new Map([[conflictAbs, conflictContent]]);
      const out = buildContextAssignString(map);
      const lines = out.split('\n');

      const beginLine = lines.find((l) => l.startsWith('--begin-context-'));
      const endLine = lines.find((l) => l.startsWith('--end-context-'));

      let token = null;
      if (beginLine) {
        token = beginLine.slice('--begin-'.length, -2);
      }

      const actual = {
        hasOriginalPattern: out.includes('--begin-context-abc--') && out.includes('--end-context-abc--'),
        beginLine: Boolean(beginLine),
        endLine: Boolean(endLine),
        tokenNotInContentAsBoundary:
          typeof token === 'string' &&
          !conflictContent.includes(`--begin-${token}--`) &&
          !conflictContent.includes(`--end-${token}--`),
      };

      const expected = {
        hasOriginalPattern: true,
        beginLine: true,
        endLine: true,
        tokenNotInContentAsBoundary: true,
      };

      record(expected, actual, JSON.stringify(expected) === JSON.stringify(actual));
    } finally {
      process.chdir(oldCwd);
    }
  }
} catch (e) {
  record('no uncaught error', String(e && e.message ? e.message : e), false);
}

process.stdout.write(JSON.stringify({ results }));
