import assert from 'assert';
import { parse, render, sliceToTask, mergeTask } from '../../src/BacklogManager/backlogIO.mjs';

const sampleContent = `## 1

**Description:** Vision document

**Status:** ok

**Affected Files:**
- docs/specs/DS01.md
- docs/specs/src/Feature.md

**Options:**
1. Fix one

**Resolution:** Approved

## 2

**Description:** Backlog manager

**Status:** needs_work

**Affected Files:**

**Options:**

**Resolution:**
`;

console.log('Testing parse...');
const sections = parse(sampleContent);
assert.deepEqual(sections['1'], {
  id: 1,
  description: 'Vision document',
  status: 'ok',
  affectedFiles: ['docs/specs/DS01.md', 'docs/specs/src/Feature.md'],
  options: [
    { id: 1, title: 'Fix one', details: '', status: '' }
  ],
  resolution: 'Approved'
});
console.log('parse tests passed.');

console.log('Testing render...');
const sectionsRender = {
  '1': {
    id: 1,
    description: 'Vision document',
    status: 'ok',
    affectedFiles: ['docs/specs/DS01.md'],
    options: [],
    resolution: 'Approved'
  }
};
const rendered = render(sectionsRender);
assert(rendered.includes('## 1'));
assert(rendered.includes('**Description:** Vision document'));
assert(rendered.includes('**Status:** ok'));
assert(rendered.includes('**Affected Files:**'));
assert(rendered.includes('- docs/specs/DS01.md'));
assert(rendered.includes('**Resolution:** Approved'));
console.log('render tests passed.');

console.log('Testing sliceToTask...');
const sliced = sliceToTask(sampleContent, '1');
assert(sliced.includes('## 1'));
assert(sliced.includes('**Description:** Vision document'));
console.log('sliceToTask tests passed.');

console.log('Testing mergeTask...');
const newSection = `## 1

**Description:** Updated

**Status:** ok

**Options:**

**Resolution:** Updated resolution
`;
const merged = mergeTask(sampleContent, newSection, '1');
assert(merged.includes('**Description:** Updated'));
assert(merged.includes('**Resolution:** Updated resolution'));
console.log('mergeTask tests passed.');

console.log('All backlogIO tests passed!');
