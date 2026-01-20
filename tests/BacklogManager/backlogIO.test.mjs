import assert from 'assert';
import { parse, render, sliceToSection, mergeSection } from '../../src/BacklogManager/backlogIO.mjs';

const sampleContent = `### File: docs/specs/DS01.md

**Description:** Vision document

**Status:** ok

**Issues:**
1. Issue one
   Details
2. Issue two

**Options:**
1. Fix one

**Resolution:** Approved

### File: docs/specs/DS02.md

**Description:** Backlog manager

**Status:** needs_work

**Issues:**

**Options:**

**Resolution:**
`;

console.log('Testing parse...');
const sections = parse(sampleContent);
assert.deepEqual(sections['docs/specs/DS01.md'], {
  name: 'docs/specs/DS01.md',
  description: 'Vision document',
  status: 'ok',
  issues: [
    { id: 1, title: 'Issue one', details: 'Details', status: '' },
    { id: 2, title: 'Issue two', details: '', status: '' }
  ],
  options: [
    { id: 1, title: 'Fix one', details: '', status: '' }
  ],
  resolution: 'Approved'
});
console.log('parse tests passed.');

console.log('Testing render...');
const sectionsRender = {
  'docs/specs/DS01.md': {
    name: 'docs/specs/DS01.md',
    description: 'Vision document',
    status: 'ok',
    issues: [{ id: 1, title: 'Issue one', details: 'Details' }],
    options: [],
    resolution: 'Approved'
  }
};
const rendered = render(sectionsRender);
assert(rendered.includes('### File: docs/specs/DS01.md'));
assert(rendered.includes('**Description:** Vision document'));
assert(rendered.includes('**Status:** ok'));
assert(rendered.includes('1. Issue one\n   Details'));
assert(rendered.includes('**Resolution:** Approved'));
console.log('render tests passed.');

console.log('Testing sliceToSection...');
const sliced = sliceToSection(sampleContent, 'docs/specs/DS01.md');
assert(sliced.includes('### File: docs/specs/DS01.md'));
assert(sliced.includes('**Description:** Vision document'));
console.log('sliceToSection tests passed.');

console.log('Testing mergeSection...');
const newSection = `### File: docs/specs/DS01.md

**Description:** Updated

**Status:** ok

**Issues:**

**Options:**

**Resolution:** Updated resolution
`;
const merged = mergeSection(sampleContent, newSection, 'docs/specs/DS01.md');
assert(merged.includes('**Description:** Updated'));
assert(merged.includes('**Resolution:** Updated resolution'));
console.log('mergeSection tests passed.');

console.log('All backlogIO tests passed!');