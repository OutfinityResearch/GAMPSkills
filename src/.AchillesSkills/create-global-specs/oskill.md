# Description
The create-global-specs skill generates high-level Global Functional Design Specifications (FDS) that capture the project's vision, scope, audience, components, and workflow. It synthesizes user input with approved backlog items to produce files like vision and workflow documents under the project's specs directory, while updating backlog statuses to reflect progress.

# Instructions
The LLM evaluates the current project context by examining the backlog for approved elements and user-provided details. It then formulates a plan to generate comprehensive global specifications that define the project's overarching structure and goals. This involves retrieving relevant backlog sections, synthesizing the information into coherent documents, and ensuring the output aligns with the project's needs. Throughout the process, it may assess the generated content for consistency and completeness, refining as necessary before committing the specifications and marking the corresponding backlog items as resolved.

# Allowed Skills
- find-sections-by-prefix
- find-approved-sections
- generate-text
- review-text
- iterate-on-feedback
- parse-file-markers
- write-file
- update-section-status