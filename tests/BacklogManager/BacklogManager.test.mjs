import assert from 'assert';
import { getTask, proposeFix, approveResolution, findTasksByStatus, setStatus, updateTask, appendTask, loadBacklog } from '../../src/BacklogManager/BacklogManager.mjs';

console.log('Setting up BacklogManager tests...');

(async () => {
  const testFilePath = 'specs_backlog.md';
  const testContent = `## 1

**Description:** Test

**Status:** ok

**Options:**

**Resolution:**`;

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

    console.log('Testing approveResolution...');
    const updatedRes = await approveResolution('specs', 1, 'Approved');
    assert(updatedRes.resolution === 'Approved');
    assert(updatedRes.status === 'ok');
    console.log('approveResolution tests passed.');

    console.log('Testing setStatus...');
    await setStatus('specs', 1, 'needs_work');
    const statusTasks = await findTasksByStatus('specs', 'needs_work');
    assert(statusTasks.includes('1'));
    console.log('setStatus tests passed.');

    console.log('Testing updateTask...');
    await updateTask('specs', 1, { description: 'Updated' });
    const updatedTask = await getTask('specs', 1);
    assert(updatedTask.description === 'Updated');
    console.log('updateTask tests passed.');

    console.log('Testing appendTask...');
    await appendTask('specs', 'Second task');
    const appendedTask = await getTask('specs', 2);
    assert(appendedTask && appendedTask.description === 'Second task');
    console.log('appendTask tests passed.');

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
