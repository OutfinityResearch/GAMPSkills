# Description
The fix-specs skill applies user-approved resolutions from the specs backlog to the actual specification files. It identifies approved backlog sections, modifies the corresponding files based on the resolutions, and updates the backlog to reflect completed changes, maintaining synchronization between plans and execution.

# Instructions
The LLM identifies backlog items that have been approved for implementation, focusing on those related to specification improvements. It then applies the agreed-upon changes to the relevant files, ensuring that the modifications address the identified issues effectively. After making the updates, it marks the corresponding backlog entries as completed, allowing the project to progress with improved specifications.

# Allowed Skills
- find-approved-sections
- read-file
- generate-text
- review-text
- merge-file-content
- write-file
- update-section-status
- update-section-content
- save-backlog