# review-docs

## Description
The review-docs skill evaluates generated HTML documentation files under the project's docs directory for quality, accuracy, and completeness. It checks for presentation issues, missing links, outdated content, or gaps relative to the project's specifications, and logs findings in the docs backlog for resolution.

## Instructions
The LLM explores the documentation files to gauge how well they represent the project's current state and user needs. It looks for elements that might confuse or mislead readers, such as incomplete explanations, broken references, or stylistic inconsistencies. By identifying these problems, it proposes enhancements that can improve the overall user experience. Each backlog task must include an **Affected Files** list that names the doc file being reviewed. The insights gained are recorded in the project's backlog, allowing for systematic improvements to the documentation over time.

## Allowed Skills
- scan-directory
- read-file
- review-file-content
- find-section-by-file-name
- append-section
- update-section-status
- update-section-content
