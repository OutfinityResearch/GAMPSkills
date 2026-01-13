/**
 * Build a comprehensive prompt for reviewing documentation files.
 *
 * @param {object} params
 * @param {Record<string,string>} params.docsMap - Map of relative path -> HTML content string.
 * @returns {string} Prompt string to send to the LLM.
 */
export function buildReviewPrompt({ docsMap }) {
  if (
    !docsMap ||
    typeof docsMap !== 'object' ||
    Array.isArray(docsMap)
  ) {
    throw new Error('buildReviewPrompt expects docsMap to be a non-array object');
  }

  const fileEntries = Object.entries(docsMap);

  const lines = [];

  // Role definition and constraints
  lines.push(
    'You are an expert technical writer and documentation auditor.',
    'You are reviewing a set of HTML documentation files for a software project.',
    '',
    'IMPORTANT CONSTRAINT:',
    '- You MUST NOT check anything against source code or implementation details.',
    '- Assume you ONLY have access to the documentation content provided below.',
    '',
    'Your goals are to assess and improve the documentation based solely on its own content and internal consistency.'
  );

  // Checklist for evaluation
  lines.push(
    '',
    'Evaluate the documentation according to the following checklist:',
    '1. Clarity and flow of explanations.',
    '2. Broken internal logic or contradictions between documents (e.g., different descriptions of the same concept).',
    '3. Completeness (obvious missing sections, missing prerequisites, missing cross-references).',
    '4. Formatting and structural consistency (headings, sections, lists, code blocks, etc.).',
    '5. Terminology consistency (same term used consistently for the same concept; no conflicting terminology).'
  );

  // Output format specification
  lines.push(
    '',
    'OUTPUT FORMAT (STRICT):',
    'You MUST respond with a single JSON object. Each key MUST be exactly one of the input file paths.',
    'The value for each key MUST be an object with the following fields:',
    '',
    '{',
    '  "<relative-file-path>": {',
    '    "description": "Brief summary of the document\'s contents and purpose.",',
    '    "status": "ok" | "needs-info" | "broken",',
    '    "issues": [',
    '      "List of concise issue descriptions, if any. Use empty array if none."',
    '    ],',
    '    "proposedFixes": [',
    '      "List of concrete, actionable fixes or improvements, if any. Use empty array if none."',
    '    ]',
    '  },',
    '  "...": {',
    '    // repeat for each input file',
    '  }',
    '}',
    '',
    'Guidance on statuses:',
    '- "ok": The document is clear, internally consistent, and structurally sound. Only minor, optional tweaks.',
    '- "needs-info": The document is mostly sound but is missing information, context, or clarity in some areas.',
    '- "broken": The document has serious structural or logical issues, severe contradictions, or is unusable without major rework.',
    '',
    'Make sure every input file path is present exactly once as a key in the JSON object.',
    'Do NOT include any commentary outside of the JSON object.'
  );

  // Append all documentation contents
  lines.push(
    '',
    '================ DOCUMENTATION SET START ================',
    ''
  );

  for (const [filePath, content] of fileEntries) {
    lines.push(
      `----- FILE START: ${filePath} -----`,
      '',
      content,
      '',
      `----- FILE END: ${filePath} -----`,
      ''
    );
  }

  lines.push('================ DOCUMENTATION SET END ================');

  return lines.join('\n');
}

export default buildReviewPrompt;