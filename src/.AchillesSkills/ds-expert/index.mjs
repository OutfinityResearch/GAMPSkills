
import { stripDependsOn } from '../../utils/ArgumentResolver.mjs';

export const DS_STRUCTURE_PROFILE = `A Global DS (Domain Specification) file is the minimal top-level document that fixes the project’s intent and boundaries. It is not a comprehensive specification and should not try to anticipate every aspect of delivery. Its role is to provide a stable, non-code reference point that remains valid even as implementation details change, while delegating depth to other DS files (e.g., requirements DS, data DS, security DS, integrations DS).
Accordingly, a Global DS should always contain only the sections that are universally necessary.
It must begin with a Vision and Problem Statement that explains, in plain language, what problem exists, why it matters, and what “better” looks like after the project succeeds. This section should state the primary value proposition and the intended outcome, avoiding solution design.
It must include Intended Users and Context of Use, identifying who the system is for and the environment in which it will be used. This should remain high-level (personas/roles and usage setting), sufficient to ground later decisions, without drifting into UI or process details.
It must define Scope and Boundaries, explicitly stating what the product is responsible for and, equally important, what it is not responsible for. This is the anchor that prevents accidental scope creep and clarifies assumptions and dependencies at a conceptual level (e.g., “relies on an existing identity provider,” “assumes source data is provided by partner systems”).
Finally, it must define Success Criteria, i.e., the conditions under which the project is considered successful. These should be outcome-oriented and, where feasible, measurable (user impact, operational impact, adoption, quality constraints), but remain free of implementation specifics. If measurement is not yet possible, the document should at least state observable indicators of success and how they would be assessed.
A Global DS may optionally contain brief Pointers to Supporting DS Files—not as mandatory sections, but as a short “map” that enumerates the other DS documents that carry the detailed constraints and designs for this project. The Global DS should remain short, stable, and authoritative, while the rest of the DS set provides modular depth.`;

function getDsExpertPromptTemplate(userPrompt = '') {
  return `You are a Design Specification (DS) expert.

Imagine you are talking to a client who can only discuss Global Design Specifications with you.
You work at a high level: vision, scope, principles, governance, stakeholders, major capabilities, risks, and success criteria.
You do not provide implementation details, code, APIs, or low-level technical decisions.

Your job is to be helpful and professional:
- Answer questions in a clear, concise DS-focused way.
- Offer practical, high-level suggestions and assumptions.
- Ask clarifying questions when needed to shape the DS.
- Keep responses short and to the point.
- Respond only with the needed content, no commentaries.

Keep everything within DS context:
- If a request is outside DS scope, reframe it to a DS perspective.
- All responses should relate to Global Design Specifications.

Style:
- Business-friendly language.
- Short sentences, short paragraphs, or bullets.
- Focus on “what” and “why,” not “how.”

You may provide:
- DS-level advice, guidance, and clarifications
- High-level drafts or outlines if requested
- Questions that help define the DS

DS file structure guidance:
${DS_STRUCTURE_PROFILE}

User Prompt:
"""
${userPrompt}
"""`;
}

function buildTechnicalPrompt(userPrompt) {
  return getDsExpertPromptTemplate(userPrompt);
}

async function executeDSGeneration({ prompt, llmAgent }) {

  const technicalPrompt = buildTechnicalPrompt(prompt);

  const response = await llmAgent.executePrompt(technicalPrompt, {
    mode: 'deep',
  });

  if (typeof response !== 'string') {
    throw new Error('ds-expert: llmAgent.executePrompt must return a string.');
  }

  return response.trim();
}

export async function action(context) {
  const { llmAgent, promptText } = context;
  const sanitizedPrompt = stripDependsOn(promptText);

  return await executeDSGeneration({ prompt: sanitizedPrompt, llmAgent });
}
