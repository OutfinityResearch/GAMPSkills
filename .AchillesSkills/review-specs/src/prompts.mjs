export function buildReviewPrompt({ specContent, codeContent, relativePath }) {
  const checklist = `Checklist:\n- Purpose and scope clearly stated.\n- Inputs/outputs, parameters, return types documented.\n- Control flow and edge cases covered.\n- Dependencies and side effects noted.\n- Consistency between spec and code.\n- Missing details or contradictions.`;
  const codeBlock = codeContent ? `\n\nJS Source (full):\n\n${codeContent}` : '\n\nJS Source: not found';
  return `You are an expert project manager and specification auditor. Review JS specs for completeness and consistency.\n\nSpec file: ${relativePath}\n\nSpec content:\n\n${specContent}${codeBlock}\n\n${checklist}\n\nRespond with JSON: {"status": "ok|needs-info|broken", "issues": [..], "proposedFixes": [..]}`;
}
