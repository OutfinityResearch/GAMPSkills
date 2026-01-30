import assert from 'assert';
import { STATUS, assertValidStatus, nextAllowed, filterByStatus, ChangeQueue } from '../../src/BacklogManager/backlogDomain.mjs';

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

console.log('Testing filterByStatus...');
const sections = {
  'file1': { status: 'ok' },
  'file2': { status: 'needs_work' }
};
assert.deepEqual(filterByStatus(sections, 'ok'), { 'file1': { status: 'ok' } });
console.log('filterByStatus tests passed.');

console.log('Testing ChangeQueue...');
const queue = new ChangeQueue();
queue.enqueue('ref1', 'change1');
queue.enqueue('ref2', 'change2');
const changes = queue.drain();
assert.deepEqual(changes, [
  { taskRef: 'ref1', change: 'change1' },
  { taskRef: 'ref2', change: 'change2' }
]);
assert.deepEqual(queue.drain(), []);
console.log('ChangeQueue tests passed.');

console.log('All backlogDomain tests passed!');
