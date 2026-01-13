export function buildReviewPrompt({ specContent, relativePath }) {
  const checklist = `Checklist:
- Purpose and scope clearly stated.
- logical flow and clarity.
- Ambiguities or contradictions within the text.
- Completeness of requirements (inputs, outputs, edge cases described conceptually).
- Formatting and structure.`;

  return `You are an expert project manager and specification auditor. Review the following specification file for internal consistency, clarity, and completeness. Do NOT assume any underlying code exists; evaluate the specification on its own merits.

Spec file: ${relativePath}

Spec content:
${specContent}

${checklist}

Respond with JSON: {"description": "Brief summary of the file content", "status": "ok|needs-info|broken", "issues": [..], "proposedFixes": [..]}`;
}
