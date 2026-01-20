import assert from 'assert';
import { STATUS, assertValidStatus, nextAllowed, normalizeIssue, toMarkdown, fromMarkdown, filterByStatus, findByFile, listIssues, ChangeQueue } from '../../src/BacklogManager/backlogDomain.mjs';

console.log('Testing STATUS enum...');
assert(STATUS.ok === 'ok');
assert(STATUS.needs_work === 'needs_work');
assert(STATUS.blocked === 'blocked');
console.log('STATUS enum tests passed.');

console.log('Testing assertValidStatus...');
assertValidStatus('ok');
try {
  assertValidStatus('invalid');
  assert(false, 'Should have thrown');
} catch (e) {
  assert(e.message.includes('Invalid status'));
}
console.log('assertValidStatus tests passed.');

console.log('Testing nextAllowed...');
assert(nextAllowed('ok', 'needs_work') === 'needs_work');
try {
  nextAllowed('ok', 'blocked');
  assert(false, 'Should have thrown');
} catch (e) {
  assert(e.message.includes('Invalid transition'));
}
console.log('nextAllowed tests passed.');

console.log('Testing normalizeIssue...');
assert.deepEqual(normalizeIssue('title'), { id: 0, title: 'title', details: '', status: '' });
assert.deepEqual(normalizeIssue({ title: 't', details: 'd' }), { id: 0, title: 't', details: 'd', status: '' });
console.log('normalizeIssue tests passed.');

console.log('Testing toMarkdown...');
const issue = { id: 1, title: 'Test', details: 'Details' };
assert(toMarkdown(issue) === '1. Test\n   Details');
console.log('toMarkdown tests passed.');

console.log('Testing fromMarkdown...');
assert.deepEqual(fromMarkdown('1. Test'), { id: 1, title: 'Test', details: '', status: '' });
console.log('fromMarkdown tests passed.');

console.log('Testing filterByStatus...');
const sections = {
  'file1': { status: 'ok' },
  'file2': { status: 'needs_work' }
};
assert.deepEqual(filterByStatus(sections, 'ok'), { 'file1': { status: 'ok' } });
console.log('filterByStatus tests passed.');

console.log('Testing findByFile...');
const sections2 = { 'file1': { name: 'file1' } };
assert.deepEqual(findByFile(sections2, 'file1'), { name: 'file1' });
assert(findByFile(sections2, 'file2') === null);
console.log('findByFile tests passed.');

console.log('Testing listIssues...');
const sections3 = {
  'file1': { issues: [{ id: 1 }, { id: 2 }] },
  'file2': { issues: [{ id: 3 }] }
};
assert.deepEqual(listIssues(sections3), [{ id: 1 }, { id: 2 }, { id: 3 }]);
console.log('listIssues tests passed.');

console.log('Testing ChangeQueue...');
const queue = new ChangeQueue();
queue.enqueue('ref1', 'change1');
queue.enqueue('ref2', 'change2');
const changes = queue.drain();
assert.deepEqual(changes, [
  { sectionRef: 'ref1', change: 'change1' },
  { sectionRef: 'ref2', change: 'change2' }
]);
assert.deepEqual(queue.drain(), []);
console.log('ChangeQueue tests passed.');

console.log('All backlogDomain tests passed!');