import assert from 'assert';
import { getSection, recordIssue, proposeFix, approveResolution, findSectionsByPrefix, findSectionByFileName, findSectionsByStatus, loadBacklog, saveBacklog } from '../../src/BacklogManager/BacklogManager.mjs';

console.log('Setting up BacklogManager tests...');

(async () => {
  const testFilePath = 'specs_backlog.md';
  const testContent = `### File: docs/specs/DS01.md

**Description:** Test

**Status:** ok

**Issues:**

**Options:**

**Resolution:**`;

  try {
    // Create the test backlog file dynamically
    const fs = await import('fs/promises');
    await fs.writeFile(testFilePath, testContent);
    console.log('Test backlog file created.');

    // First, load and modify a section
    await loadBacklog('specs'); // now the file exists

    console.log('Testing getSection...');
    const section = await getSection('specs', 'docs/specs/DS01.md');
    assert(section && section.name === 'docs/specs/DS01.md');
    console.log('getSection tests passed.');

    console.log('Testing recordIssue...');
    const initialSection = await getSection('specs', 'docs/specs/DS01.md');
    const initialIssuesLength = initialSection.issues.length;
    const updatedIssue = await recordIssue('specs', 'docs/specs/DS01.md', 'New issue');
    assert(updatedIssue.issues.length === initialIssuesLength + 1);
    assert(updatedIssue.issues[updatedIssue.issues.length - 1].title === 'New issue');
    console.log('recordIssue tests passed.');

    console.log('Testing proposeFix...');
    const initialSection2 = await getSection('specs', 'docs/specs/DS01.md');
    const initialOptionsLength = initialSection2.options.length;
    const updatedFix = await proposeFix('specs', 'docs/specs/DS01.md', 'New fix');
    assert(updatedFix.options.length === initialOptionsLength + 1);
    assert(updatedFix.options[updatedFix.options.length - 1].title === 'New fix');
    console.log('proposeFix tests passed.');

    console.log('Testing approveResolution...');
    const updatedRes = await approveResolution('specs', 'docs/specs/DS01.md', 'Approved');
    assert(updatedRes.resolution === 'Approved');
    assert(updatedRes.status === 'ok');
    console.log('approveResolution tests passed.');

    console.log('Testing findSectionsByPrefix...');
    const names = await findSectionsByPrefix('specs', 'docs/specs');
    assert.deepEqual(names, ['docs/specs/DS01.md']);
    console.log('findSectionsByPrefix tests passed.');

    console.log('Testing findSectionByFileName...');
    const name = await findSectionByFileName('specs', 'DS01.md');
    assert(name === 'docs/specs/DS01.md');
    console.log('findSectionByFileName tests passed.');

    console.log('Testing findSectionsByStatus...');
    const namesStatus = await findSectionsByStatus('specs', 'ok');
    assert(namesStatus.includes('docs/specs/DS01.md'));
    console.log('findSectionsByStatus tests passed.');

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