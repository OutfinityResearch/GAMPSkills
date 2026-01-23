
import { resolveArguments } from '../../ArgumentResolver.mjs';

function validateInputs(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('ds-expert: options object is required.');
  }

  const { prompt, llmAgent } = options;

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('ds-expert: "prompt" (non-empty string) is required.');
  }

  if (!llmAgent || typeof llmAgent.executePrompt !== 'function') {
    throw new Error(
      'ds-expert: "llmAgent" with an "executePrompt" function is required.'
    );
  }
}

function buildTechnicalPrompt(userPrompt) {
  return `
You are acting as a "Design Specification (DS) Expert".

Your task is to generate a *non-technical*, *strategic* Design Specification (DS) document in **Markdown** format.

The DS document must be accessible to non-technical stakeholders, focusing on the **what** and **why**, and avoiding implementation details, code, APIs, or low-level technical decisions.

---

## DS Document Requirements

### 1. Scope & Perspective
- **Global Scope**: Describe entire systems, products, major workflows, or major components. Do **not** focus on individual files, classes, or functions.
- **Vision-Oriented**: Explain the big picture, intended outcomes, and how success will be recognized.
- **Strategic**: Capture key decisions, constraints, and governance aspects.
- **Non-Technical Language**: Avoid code, configuration syntax, or detailed implementation plans.

### 2. Content Characteristics
The DS must:
- Emphasize *what* is being built and *why* it matters.
- Avoid step-by-step implementation details or specific technologies.
- Be understandable by product owners, leadership, and cross‑functional stakeholders.
- Provide clear guidance and boundaries for later, more detailed specifications.

### 3. Typical DS Topics (examples, choose what fits the user prompt)
You may cover, as appropriate:
- Overall product or project **vision** and strategic goals.
- High-level **scope** and boundaries of the initiative.
- Major **user groups** / stakeholders and their needs.
- High-level **workflows**, journeys, or value streams.
- High-level **component or capability architecture** (conceptual only).
- Approach to **backlog management** and prioritization (conceptual).
- **Specification structure and workflow** (how specs are organized, reviewed).
- **Governance and review processes**.
- **Principles and guidelines** for design and decision-making.
- Expected **outcomes**, **success criteria**, and **KPIs** at a strategic level.
- Key **risks, assumptions, and constraints**.

### 4. Required Markdown Structure

Produce the DS content in Markdown with clear top-level sections.
At a minimum, include the following headings (you may add more if useful):

- # Overview
- # Purpose
- # Role of This Specification
- # Vision
- # Guiding Principles
- # Scope and Boundaries
- # Stakeholders and Users
- # High-Level Capabilities and Workflows
- # Governance and Decision-Making
- # Success Criteria and Outcomes
- # Risks, Assumptions, and Constraints
- # Next Steps

Each section should:
- Stay at a **strategic, conceptual, or organizational** level.
- Avoid any mention of specific code, APIs, frameworks, or low-level designs.

---

## Style Guidelines

- Use clear, concise, and structured language.
- Prefer short paragraphs, bullet lists, and subheadings for readability.
- Do **not** include any source code blocks or pseudo-code.
- Write as if this document will guide multiple teams for several months.

---

## User Instructions

The following is the user's prompt describing what the DS should focus on.
Use it as the primary source of context, while **respecting all DS constraints above**.

User Prompt:
"""
${userPrompt}
"""

---

Now, generate the full Design Specification (DS) in Markdown following the structure and guidelines above.
`.trim();
}

export async function action(context) {
  const { llmAgent, recursiveAgent, ...args } = context;
  
  // If we have structured args already, use them directly
  if (args.prompt) {
    return await executeDSGeneration({ prompt: args.prompt, llmAgent });
  }
  
  // Otherwise, resolve from natural language input
  const prompt = args.input || Object.values(args)[0];
  if (!prompt) {
    throw new Error('No input provided for ds-expert operation');
  }
  
  const schema = ['prompt'];
  const regexPatterns = [
    /generate\s+ds\s+(?:content\s+)?(?:for\s+)?(.+)/i,
    /create\s+(?:a\s+)?ds\s+(?:for\s+)?(.+)/i,
    /write\s+ds\s+(?:content\s+)?(?:for\s+)?(.+)/i,
  ];
  
  const resolvedArgs = await resolveArguments(
    llmAgent,
    prompt,
    'Extract DS generation prompt',
    schema,
    regexPatterns
  );
  
  const [dsPrompt] = resolvedArgs;
  return await executeDSGeneration({ prompt: dsPrompt || prompt, llmAgent });
}

async function executeDSGeneration({ prompt, llmAgent }) {
  validateInputs({ prompt, llmAgent });

  const technicalPrompt = buildTechnicalPrompt(prompt);

  const response = await llmAgent.executePrompt({
    prompt: technicalPrompt,
    mode: 'deep',
  });

  if (typeof response !== 'string') {
    throw new Error('ds-expert: llmAgent.executePrompt must return a string.');
  }

  return response.trim();
}

export default action;