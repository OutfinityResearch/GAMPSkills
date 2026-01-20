# Description
The create-tests-specs skill produces detailed functional design specifications for tests, describing assertions, inputs, outputs, and scenarios under the project's specs tests directory. It leverages global and source specifications along with user prompts to define comprehensive test coverage without generating code.

# Instructions
The LLM combines global project overviews, technical source details, and user guidance to outline thorough testing strategies. It structures test descriptions to cover various scenarios and edge cases, ensuring the specifications provide clear guidance for validation. The content is developed iteratively, allowing for review and refinement to match the project's testing needs and maintain alignment with implementation goals.

# Allowed Skills
- scan-directory
- read-file
- generate-text
- review-text
- iterate-on-feedback
- parse-file-markers
- write-file