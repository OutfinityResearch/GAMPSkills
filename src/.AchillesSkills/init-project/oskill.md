# Description
The init-project skill bootstraps a new project by setting up the required directory structure for specifications and documentation, installing static tools, and initializing project backlogs. It analyzes the user's project description to seed the backlog with initial questions, proposals, and structural guidance that reflect the project's complexity and scope.

# Instructions
The LLM begins by understanding the user's intent for the project, then dynamically constructs a sequence of actions to prepare the environment. It considers creating necessary directories to organize the project, copying essential static files for tooling, and generating initial content for the backlog based on the project description. To ensure quality, it may review the generated content for completeness and relevance, iterating on any identified gaps before finalizing the setup. The process involves carefully sequencing file system operations and backlog initialization to establish a solid foundation for the project.

# Allowed Skills
- create-directories
- copy-file
- generate-text
- review-text
- iterate-on-feedback
- save-backlog