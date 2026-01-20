# Description
The fix-docs skill applies user-approved resolutions from the docs backlog to HTML documentation files. It processes approved items, updates the corresponding documentation files, and clears the backlog entries to indicate completion, ensuring documentation remains current and accurate.

# Instructions
The LLM locates approved documentation-related items in the backlog and implements the specified fixes to the HTML files. It ensures that changes enhance clarity, accuracy, and usability without introducing new issues. Once the updates are applied, it updates the backlog to reflect the completed work, keeping the documentation aligned with project changes.

# Allowed Skills
- find-approved-sections
- read-file
- generate-text
- review-text
- merge-file-content
- write-file
- update-section-status
- update-section-content