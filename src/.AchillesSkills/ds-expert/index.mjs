function validateInputs(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('ds-expert: options object is required.');
  }

  const { prompt, llmAgent } = options;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('ds-expert: "prompt" (non-empty string) is required.');
  }

  if (!llmAgent || typeof llmAgent.executePrompt !== 'function') {
    throw new Error(
      'ds-expert: "llmAgent" with an "executePrompt" function is required.'
    );
  }
}

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
  validateInputs({ prompt, llmAgent });

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

  return await executeDSGeneration({ prompt: promptText, llmAgent });
}