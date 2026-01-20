import assert from 'assert';
import { BacklogManager } from '../../src/BacklogManager/BacklogManager.mjs';

let manager;

console.log('Setting up BacklogManager tests...');
manager = new BacklogManager();
// Manually set sections for testing
manager.specsSections = {
  'docs/specs/DS01.md': {
    name: 'docs/specs/DS01.md',
    description: 'Test',
    status: 'ok',
    issues: [],
    options: [],
    resolution: ''
  }
};
manager.currentType = 'specs';

console.log('Testing getSection...');
const section = manager.getSection('docs/specs/DS01.md');
assert(section.name === 'docs/specs/DS01.md');
console.log('getSection tests passed.');

console.log('Testing recordIssue...');
const updatedIssue = manager.recordIssue('docs/specs/DS01.md', 'New issue');
assert(updatedIssue.issues.length === 1);
assert(updatedIssue.issues[0].title === 'New issue');
console.log('recordIssue tests passed.');

console.log('Testing proposeFix...');
const updatedFix = manager.proposeFix('docs/specs/DS01.md', 'New fix');
assert(updatedFix.options.length === 1);
assert(updatedFix.options[0].title === 'New fix');
console.log('proposeFix tests passed.');

console.log('Testing approveResolution...');
const updatedRes = manager.approveResolution('docs/specs/DS01.md', 'Approved');
assert(updatedRes.resolution === 'Approved');
assert(updatedRes.status === 'ok');
console.log('approveResolution tests passed.');

console.log('Testing findSectionsByPrefix...');
const names = manager.findSectionsByPrefix('specs', 'docs/specs');
assert.deepEqual(names, ['docs/specs/DS01.md']);
console.log('findSectionsByPrefix tests passed.');

console.log('Testing findSectionByFileName...');
const name = manager.findSectionByFileName('specs', 'DS01.md');
assert(name === 'docs/specs/DS01.md');
console.log('findSectionByFileName tests passed.');

console.log('Testing findSectionsByStatus...');
const namesStatus = manager.findSectionsByStatus('specs', 'ok');
assert.deepEqual(namesStatus, ['docs/specs/DS01.md']);
console.log('findSectionsByStatus tests passed.');

console.log('All BacklogManager tests passed!');