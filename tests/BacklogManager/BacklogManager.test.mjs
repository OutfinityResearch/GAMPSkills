import assert from 'assert';
import { getTask, proposeFix, approveResolution, findTasksByStatus, setStatus, updateTask, appendTask, loadBacklog, markDone, addOptionsFromText } from '../../src/BacklogManager/BacklogManager.mjs';

console.log('Setting up BacklogManager tests...');

(async () => {
  const testFilePath = 'specs_backlog.md';
  const testContent = `## 1

**Description:** Test

**Options:**
1. First option
`;

  try {
    // Create the test backlog file dynamically
    const fs = await import('fs/promises');
    await fs.writeFile(testFilePath, testContent);
    console.log('Test backlog file created.');

    // First, load and modify a section
    await loadBacklog('specs'); // now the file exists

    console.log('Testing getTask...');
    const section = await getTask('specs', 1);
    assert(section && section.id === 1);
    console.log('getTask tests passed.');

    console.log('Testing proposeFix...');
    const initialSection2 = await getTask('specs', 1);
    const initialOptionsLength = initialSection2.options.length;
    const updatedFix = await proposeFix('specs', 1, 'New fix');
    assert(updatedFix.options.length === initialOptionsLength + 1);
    assert(updatedFix.options[updatedFix.options.length - 1].title === 'New fix');
    console.log('proposeFix tests passed.');

    console.log('Testing addOptionsFromText...');
    const optionsText = `1. First option\n2. Second option\n- Third option`;
    const updatedFromText = await addOptionsFromText('specs', 1, optionsText);
    assert(updatedFromText.options.length >= 3);
    assert(updatedFromText.options[updatedFromText.options.length - 3].title === 'First option');
    assert(updatedFromText.options[updatedFromText.options.length - 2].title === 'Second option');
    assert(updatedFromText.options[updatedFromText.options.length - 1].title === 'Third option');
    console.log('addOptionsFromText tests passed.');

    console.log('Testing approveResolution...');
    const updatedRes = await approveResolution('specs', 1, 'Approved');
    assert(updatedRes.resolution === 'Approved');
    assert(updatedRes.options.length === 0);
    console.log('approveResolution tests passed.');

    console.log('Testing findTasksByStatus...');
    const doneTasks = await findTasksByStatus('specs', 'done');
    assert(doneTasks.some((task) => task.id === 1));
    console.log('findTasksByStatus tests passed.');

    console.log('Testing setStatus...');
    await setStatus('specs', 1, 'done');
    const removedTask = await getTask('specs', 1);
    assert(removedTask === null);
    const afterDone = await loadBacklog('specs');
    assert(afterDone.history.length === 1);
    console.log('setStatus tests passed.');

    console.log('Testing appendTask...');
    await appendTask('specs', 'Second task');
    const afterAppend = await loadBacklog('specs');
    const appendedTask = Object.values(afterAppend.tasks).find((task) => task.description === 'Second task');
    assert(appendedTask);
    console.log('appendTask tests passed.');

    console.log('Testing updateTask...');
    await updateTask('specs', appendedTask.id, { description: 'Updated' });
    const updatedTask = await getTask('specs', appendedTask.id);
    assert(updatedTask.description === 'Updated');
    console.log('updateTask tests passed.');

    console.log('Testing markDone...');
    await markDone('specs', appendedTask.id, 'Executed');
    const afterMarkDone = await loadBacklog('specs');
    assert(afterMarkDone.history.length === 2);
    assert(afterMarkDone.history[1].resolution === 'Executed');
    console.log('markDone tests passed.');

    console.log('All BacklogManager tests passed!');
  } catch (e) {
    console.error('Test failed:', e);
  } finally {
    // Clean up: delete the test file
    try {
      const fs = await import('fs/promises');
      await fs.unlink(testFilePath);
      console.log('Test backlog file deleted.');
    } catch (cleanupError) {
      console.error('Failed to delete test file:', cleanupError);
    }
  }
})();
