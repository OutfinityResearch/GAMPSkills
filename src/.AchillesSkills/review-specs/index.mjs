
import { stripDependsOn } from '../../utils/ArgumentResolver.mjs';

function buildReviewPrompt(userPrompt) {
  const template = `You are a specification reviewer.

Analyze the provided specification files content from all perspectives.
If the user input includes extra review conditions or priorities, follow those first.
If no specific review type is requested, perform a general review.

Find any type of problems, including:
- Syntax or structural issues
- Semantic problems or incorrect statements
- Consistency issues within a file or across files
- Missing or invalid dependencies between files (including references to files not present in the input context)
- Any other gaps or contradictions

Output format:
- If problems are found, output one line per problem:
  <file_path> - <exact problems described one by one>
  Example: ./path/to/file - missing header that exists in other files; dependency ./dep/dep2 is not present in the provided context
- If no problems are found, output exactly: "No problems detected."

Do not include extra commentary, headings, or code.

User input:
"""
${userPrompt}
"""`;
  return template;
}

async function executeReview({ prompt, llmAgent }) {

  const reviewPrompt = buildReviewPrompt(prompt);

  const response = await llmAgent.executePrompt(reviewPrompt, {
    mode: 'deep',
  });

  if (typeof response !== 'string') {
    throw new Error('review-specs: llmAgent.executePrompt must return a string.');
  }

  return response.trim();
}

export async function action(context) {
  const { llmAgent, promptText } = context;
  const sanitizedPrompt = stripDependsOn(promptText);

  return await executeReview({ prompt: sanitizedPrompt, llmAgent });
}
