
import { stripDependsOn } from '../../utils/ArgumentResolver.mjs';

function buildTechnicalPrompt(userPrompt) {
  const template = `You are a Design Specification (DS) expert.

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

User Prompt:
"""
${userPrompt}
"""`;
  return template;
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
