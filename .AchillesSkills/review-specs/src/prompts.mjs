// Review Specs Prompts
// Builds the prompt sent to the LLM for reviewing a single spec file.

/**
 * Build the prompt for reviewing a specification markdown file.
 *
 * @param {Object} params
 * @param {string} params.specContent - The raw text content of the spec file.
 * @param {string} params.relativePath - The relative path of the spec file.
 * @returns {string} The prompt text to send to the LLM.
 */
export function buildReviewPrompt({ specContent, relativePath }) {
  if (typeof specContent !== 'string') {
    throw new TypeError('buildReviewPrompt: specContent must be a string');
  }
  if (typeof relativePath !== 'string') {
    throw new TypeError('buildReviewPrompt: relativePath must be a string');
  }

  return [
    'You are an expert project manager and specification auditor.',
    '',
    'You are reviewing a single Markdown specification file from a JavaScript project.',
    '',
    'CRITICAL CONSTRAINT:',
    '- Do NOT assume any implementation code exists.',
    '- Evaluate the specification *purely on its own merits* as a document.',
    '',
    `File being reviewed: ${relativePath}`,
    '',
    '--- BEGIN SPEC CONTENT ---',
    specContent,
    '--- END SPEC CONTENT ---',
    '',
    'Evaluate this specification according to the following checklist:',
    '1. Clarity of purpose and scope.',
    '2. Logical flow of sections and ideas.',
    '3. Internal ambiguities or contradictions.',
    '4. Conceptual completeness: requirements, inputs/outputs, edge cases.',
    '5. Formatting and structure: headings, lists, and consistency.',
    '',
    'Your response MUST be ONLY valid JSON and MUST match this schema exactly:',
    '',
    '{',
    '  "description": string,             // brief summary of what this spec covers',
    '  "status": "ok" | "needs-info" | "broken",',
    '  "issues": string[],                // specific problems; [] or ["none"] when truly none',
    '  "proposedFixes": string[]          // concrete suggestions to improve the spec',
    '}',
    '',
    'Rules:',
    '- Use "ok" only if the spec is clear, consistent, and practically ready to implement.',
    '- Use "needs-info" if important details are missing or unclear.',
    '- Use "broken" if the spec is self-contradictory or fundamentally unusable.',
    '- When status is "ok", issues and proposedFixes may be ["none"] if there are no meaningful problems.',
    '- Do NOT include any commentary outside the JSON.',
  ].join('\n');
}