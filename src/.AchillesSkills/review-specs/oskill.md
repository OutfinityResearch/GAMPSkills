# Description
The review-specs skill analyzes existing specification files for gaps, inconsistencies, errors, and areas needing improvement. It examines all markdown files under the project's specs directory, records findings as issues and proposed fixes in the specs backlog, and ensures traceability by updating backlog sections accordingly.

# Instructions
The LLM starts by surveying the specification files in the project to understand the current state of documentation. It systematically evaluates each file for potential problems, clarity issues, or missing details that could impact the project's success. Based on this assessment, it identifies specific concerns and suggests actionable improvements. The findings are then integrated into the project's backlog, where they can be tracked and addressed, ensuring that the specifications evolve to meet the project's requirements through iterative refinement.

# Allowed Skills
- scan-directory
- read-file
- review-file-content
- load-backlog
- find-section-by-file-name
- append-section
- update-section-status
- update-section-content
- save-backlog