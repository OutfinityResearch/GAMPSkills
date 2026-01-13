/**
 * Build the initialization prompt for the LLM.
 *
 * @param {string} userPrompt - User-supplied project blueprint / description.
 * @returns {string} Prompt text to send to the LLM.
 */
export function buildInitPrompt(userPrompt = '') {
  const trimmed = (userPrompt || '').trim();

  const contextSection = trimmed
    ? `The user has provided the following initial project blueprint for a JavaScript project:\n\n` +
      `--- BEGIN USER BLUEPRINT ---\n${trimmed}\n--- END USER BLUEPRINT ---\n`
    : `The user has NOT provided a specific blueprint. Ask foundational, high‑leverage questions needed to shape a coherent JavaScript project specification.\n`;

  return [
    'You are an expert project manager and specification auditor.',
    '',
    'Your task:',
    '- Assess the current understanding of a JavaScript project.',
    '- Identify missing details, ambiguities, and assumptions that must be clarified',
    '  before writing a coherent and implementable specification.',
    '',
    'CRITICAL CONSTRAINTS:',
    '- Do NOT invent or assume features, flows, or requirements that are not implied by the user blueprint.',
    '- Instead, ask precise clarification questions.',
    '- Keep your output concise and focused on the most important gaps.',
    '',
    'CONTEXT:',
    contextSection,
    'Focus your questions on these areas:',
    '- Goals and scope: what problem is being solved, for whom, and what is explicitly in/out of scope?',
    '- User roles: which distinct user types or actors exist and what are their responsibilities?',
    '- Primary flows: key user journeys and core use cases the system must support.',
    '- Data model: main entities, attributes, relationships, and lifecycle considerations.',
    '- Integrations: external APIs, services, authentication providers, or infrastructure dependencies.',
    '- Non-functional requirements: performance, security, privacy, compliance, scalability, reliability, and UX constraints.',
    '- Risks, timeline, and acceptance criteria: project risks, milestones, delivery expectations, and how success will be evaluated.',
    '',
    'OUTPUT FORMAT (STRICT):',
    'Respond with a single JSON object ONLY, no commentary, no markdown, no code fences. The JSON MUST conform to this schema:',
    '',
    '{',
    '  "status": "ok" | "needs-info" | "broken",',
    '  "issues": [',
    '    // An array of detailed questions or issue descriptions, each as a string.',
    '  ],',
    '  "proposedFixes": [',
    '    // An array of suggestions indicating what specific information',
    '    // the user should provide to resolve the above issues.',
    '  ]',
    '}',
    '',
    'Guidance:',
    '- Use "needs-info" when there are important unknowns that require user clarification.',
    '- Use "ok" only if you believe there is already enough information to draft a first-pass specification.',
    '- Use "broken" if the blueprint is self-contradictory, impossible, or otherwise unusable without major rethinking.',
    '- Each entry in "issues" should be a direct, answerable question or a clear statement of what is missing/unclear.',
    '- Each entry in "proposedFixes" should tell the user exactly what information to add or clarify.',
  ].join('\n');
}

export default buildInitPrompt;