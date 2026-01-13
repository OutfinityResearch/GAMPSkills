export function buildReviewPrompt({ docsMap }) {
  const checklist = `Checklist:
- Clarity and flow of information.
- Broken internal logic or contradictions between documents.
- Completeness of sections (empty placeholders, missing descriptions).
- Formatting and structural consistency (headings, lists, code blocks).
- Terminology consistency across files.`;

  let docsBlock = '\n\nDOCUMENTATION FILES:\n';
  for (const [relPath, content] of Object.entries(docsMap)) {
    docsBlock += `\n--- FILE: ${relPath} ---\n${content}\n`;
  }

  return `You are an expert technical writer and documentation auditor. Review the following HTML documentation files for internal consistency, clarity, and structural integrity. Do NOT check against source code.

${docsBlock}

${checklist}

Respond with a JSON object where keys are the relative file paths of the documentation files, and values are objects containing "description" (string), "status" (ok|needs-info|broken), "issues" (array of strings), and "proposedFixes" (array of strings).
Example format:
{
  "docs/index.html": { "description": "Main landing page describing the project overview.", "status": "broken", "issues": ["Reference to 'User' entity conflicts with 'Account' entity used in other files"], "proposedFixes": ["Standardize on 'User'"] }
}`;
}
