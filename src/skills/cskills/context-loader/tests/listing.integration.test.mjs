import { listDirectory, buildMatcher } from '../src/listing.mjs';

const results = [];
const fixtureRoot = 'tests/fixtures/listing-tree';

const sortPaths = (arr) => [...arr].sort();
const sameSortedArray = (a, b) => (
  Array.isArray(a) &&
  Array.isArray(b) &&
  JSON.stringify(sortPaths(a)) === JSON.stringify(sortPaths(b))
);

function pushResult(expected, actual, pass) {
  results.push({ expected, actual, pass });
}

async function safeList(options) {
  try {
    return await listDirectory(options);
  } catch (e) {
    return `THREW:${e?.message || String(e)}`;
  }
}

// (1) buildMatcher wildcard semantics and regex escaping
const starMatcher = buildMatcher('*.js');
const starActual = [
  starMatcher('index.js'),
  starMatcher('util.ts'),
  starMatcher('file+.js'),
];
const starExpected = [true, false, true];
pushResult(starExpected, starActual, JSON.stringify(starExpected) === JSON.stringify(starActual));

const qMatcher = buildMatcher('file?.js');
const qActual = [
  qMatcher('file1.js'),
  qMatcher('file12.js'),
  qMatcher('fileA.js'),
];
const qExpected = [true, false, true];
pushResult(qExpected, qActual, JSON.stringify(qExpected) === JSON.stringify(qActual));

const literalMatcher = buildMatcher('file+.js');
const literalActual = [
  literalMatcher('file+.js'),
  literalMatcher('fileA.js'),
  literalMatcher('file+.jsx'),
];
const literalExpected = [true, false, false];
pushResult(literalExpected, literalActual, JSON.stringify(literalExpected) === JSON.stringify(literalActual));

// (2) default exclusions skip EXCLUDED_DIRS and hidden directories
const defaultListRaw = await safeList({ dir: fixtureRoot, maxDepth: 5 });
const defaultExpected = [
  'app',
  'app/file+.js',
  'app/index.js',
  'app/readme.md',
  'app/util.ts',
  'docs',
  'docs/guide.md',
  'nested',
  'nested/deep',
  'nested/deep/deeper',
  'nested/deep/deeper/too-deep.js',
  'nested/deep/file.txt',
];
const defaultActual = Array.isArray(defaultListRaw) ? sortPaths(defaultListRaw) : defaultListRaw;
pushResult(sortPaths(defaultExpected), defaultActual, sameSortedArray(defaultExpected, defaultListRaw));

const relForwardSlashExpected = true;
const relForwardSlashActual = Array.isArray(defaultListRaw)
  ? defaultListRaw.every((p) => !p.startsWith('/') && !p.startsWith('\\') && !p.includes('\\'))
  : false;
pushResult(relForwardSlashExpected, relForwardSlashActual, relForwardSlashExpected === relForwardSlashActual);

// (3) explicit dir containing excluded segment disables default exclusions for that run
const nodeModulesRaw = await safeList({ dir: `${fixtureRoot}/node_modules`, maxDepth: 5 });
const nodeModulesExpected = ['pkg', 'pkg/index.js'];
const nodeModulesActual = Array.isArray(nodeModulesRaw) ? sortPaths(nodeModulesRaw) : nodeModulesRaw;
pushResult(sortPaths(nodeModulesExpected), nodeModulesActual, sameSortedArray(nodeModulesExpected, nodeModulesRaw));

// (4) filter applies only to files (directories still listed)
const filteredRaw = await safeList({ dir: fixtureRoot, maxDepth: 5, filter: '*.md' });
const filteredExpected = [
  'app',
  'app/readme.md',
  'docs',
  'docs/guide.md',
  'nested',
  'nested/deep',
  'nested/deep/deeper',
];
const filteredActual = Array.isArray(filteredRaw) ? sortPaths(filteredRaw) : filteredRaw;
pushResult(sortPaths(filteredExpected), filteredActual, sameSortedArray(filteredExpected, filteredRaw));

// (4) exclude applies by entry name to both file and directory entries
const excludeDirRaw = await safeList({ dir: fixtureRoot, maxDepth: 5, exclude: 'deep' });
const excludeDirExpected = [
  'app',
  'app/file+.js',
  'app/index.js',
  'app/readme.md',
  'app/util.ts',
  'docs',
  'docs/guide.md',
  'nested',
];
const excludeDirActual = Array.isArray(excludeDirRaw) ? sortPaths(excludeDirRaw) : excludeDirRaw;
pushResult(sortPaths(excludeDirExpected), excludeDirActual, sameSortedArray(excludeDirExpected, excludeDirRaw));

const excludeFileRaw = await safeList({ dir: fixtureRoot, maxDepth: 5, exclude: 'readme.md' });
const excludeFileExpected = [
  'app',
  'app/file+.js',
  'app/index.js',
  'app/util.ts',
  'docs',
  'docs/guide.md',
  'nested',
  'nested/deep',
  'nested/deep/deeper',
  'nested/deep/deeper/too-deep.js',
  'nested/deep/file.txt',
];
const excludeFileActual = Array.isArray(excludeFileRaw) ? sortPaths(excludeFileRaw) : excludeFileRaw;
pushResult(sortPaths(excludeFileExpected), excludeFileActual, sameSortedArray(excludeFileExpected, excludeFileRaw));

// (5) maxDepth boundary check
const depthRaw = await safeList({ dir: fixtureRoot, maxDepth: 3 });
const depthExpected = [
  'app',
  'app/file+.js',
  'app/index.js',
  'app/readme.md',
  'app/util.ts',
  'docs',
  'docs/guide.md',
  'nested',
  'nested/deep',
  'nested/deep/deeper',
  'nested/deep/file.txt',
];
const depthActual = Array.isArray(depthRaw) ? sortPaths(depthRaw) : depthRaw;
pushResult(sortPaths(depthExpected), depthActual, sameSortedArray(depthExpected, depthRaw));

// (6) nonexistent directory returns empty list without throw
const missingRaw = await safeList({ dir: `${fixtureRoot}/does-not-exist`, maxDepth: 5 });
const missingExpected = [];
const missingActual = Array.isArray(missingRaw) ? missingRaw : missingRaw;
pushResult(missingExpected, missingActual, Array.isArray(missingRaw) && missingRaw.length === 0);

process.stdout.write(JSON.stringify({ results }));
