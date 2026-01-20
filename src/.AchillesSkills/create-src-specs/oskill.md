# Description
The create-src-specs skill generates detailed technical functional design specifications for source code, mirroring the project's source structure. It uses global specifications and user prompts to produce markdown files describing functions, inputs, outputs, dependencies, and test links under the specs source directory.

# Instructions
The LLM integrates global project specifications with user-provided requirements to develop comprehensive technical descriptions for source components. It organizes the details into structured specifications that support accurate implementation. The process involves synthesizing information from various sources, ensuring the output is detailed and aligned with the project's technical needs, potentially refining the content through evaluation and adjustment to achieve clarity and completeness.

# Allowed Skills
- scan-directory
- read-file
- generate-text
- review-text
- iterate-on-feedback
- parse-file-markers
- write-file
