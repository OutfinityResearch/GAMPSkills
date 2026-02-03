import assert from 'assert';
import { parse, render, sliceToTask, mergeTask } from '../../src/BacklogManager/backlogIO.mjs';

const sampleContent = `## 1

**Description:** Vision document

**Resolution:** Approved

## 2

**Description:** Backlog manager

**Options:**
1. Fix one

# History

## 1

**Description:** Old task

**Resolution:** Done
`;

console.log('Testing parse...');
const { tasks, history } = parse(sampleContent);
assert.deepEqual(tasks['1'], {
  id: 1,
  description: 'Vision document',
  options: [],
  resolution: 'Approved'
});
assert.deepEqual(tasks['2'], {
  id: 2,
  description: 'Backlog manager',
  options: [
    { id: 1, title: 'Fix one', details: '', status: '' }
  ],
  resolution: ''
});
assert.deepEqual(history[0], {
  id: 1,
  description: 'Old task',
  options: [],
  resolution: 'Done'
});
console.log('parse tests passed.');

console.log('Testing render...');
const sectionsRender = {
  tasks: {
    '1': {
      id: 1,
      description: 'Vision document',
      options: [],
      resolution: 'Approved'
    },
    '2': {
      id: 2,
      description: 'Backlog manager',
      options: [{ id: 1, title: 'Fix one', details: '', status: '' }],
      resolution: ''
    }
  },
  history: [
    {
      id: 10,
      description: 'Old task',
      options: [],
      resolution: 'Done'
    }
  ]
};
const rendered = render(sectionsRender);
assert(rendered.includes('## 1'));
assert(rendered.includes('**Description:** Vision document'));
assert(rendered.includes('**Resolution:** Approved'));
assert(rendered.includes('## 2'));
assert(rendered.includes('**Options:**'));
assert(rendered.includes('1. Fix one'));
assert(rendered.includes('# History'));
assert(rendered.includes('**Description:** Old task'));
console.log('render tests passed.');

console.log('Testing sliceToTask...');
const sliced = sliceToTask(sampleContent, '1');
assert(sliced.includes('## 1'));
assert(sliced.includes('**Description:** Vision document'));
console.log('sliceToTask tests passed.');

console.log('Testing mergeTask...');
const newSection = `## 1

**Description:** Updated

**Resolution:** Updated resolution
`;
const merged = mergeTask(sampleContent, newSection, '1');
assert(merged.includes('**Description:** Updated'));
assert(merged.includes('**Resolution:** Updated resolution'));
assert(merged.includes('# History'));
console.log('mergeTask tests passed.');

console.log('All backlogIO tests passed!');
