/**
 * FDS Expert Skill
 *
 * Generates File Design Specification (FDS) content with detailed technical
 * implementation information, suitable as a blueprint for regenerating code
 * for a single module/file.
 *
 * This module is intentionally small and focused on prompt engineering and
 * delegation to an injected LLM agent.
 */

import { resolveArguments } from '../../ArgumentResolver.mjs';

/**
 * Validate the input options for the FDS expert.
 *
 * @param {object} options
 * @param {string} options.prompt - User instructions for FDS generation.
 * @param {object} options.llmAgent - LLM agent with an executePrompt method.
 * @throws {Error} If required properties are missing or invalid.
 */
function validateOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('fdsExpert: options object is required.');
  }

  const { prompt, llmAgent } = options;

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('fdsExpert: "prompt" (non-empty string) is required.');
  }

  if (!llmAgent || typeof llmAgent !== 'object') {
    throw new Error('fdsExpert: "llmAgent" (object) is required.');
  }

  if (typeof llmAgent.executePrompt !== 'function') {
    throw new Error(
      'fdsExpert: "llmAgent" must expose an executePrompt(prompt, options?) function.'
    );
  }
}

/**
 * Build the technical prompt given the user-provided instructions.
 *
 * The constructed prompt:
 * - Defines the FDS format and characteristics.
 * - Enumerates all required sections.
 * - Emphasizes that the result must be regeneration-ready.
 * - Embeds the original user prompt at the end.
 *
 * @param {string} userPrompt - Original user instructions for FDS generation.
 * @returns {string} - Fully constructed technical prompt.
 */
function buildTechnicalPrompt(userPrompt) {
  const trimmedUserPrompt = userPrompt.trim();

  return `
You are an expert senior software engineer and technical architect.

Your task: Generate a **File Design Specification (FDS)** for a *single code module/file*.
This FDS must be **implementation-focused**, **file-specific**, and **regeneration-ready**,
so that another engineer can fully reconstruct the source code for the file from the FDS alone.

## FDS Format (Markdown)

Produce a **Markdown** document with the following top-level sections in this exact order:

1. Description
2. Dependencies
3. Main Functions/Methods
4. Exports
5. Implementation Details

Each section should be detailed and technically precise.

---

### 1. Description

Explain:
- The purpose of this specific module/file.
- Its role in the overall system.
- What kinds of responsibilities it has and what it explicitly does *not* do.

---

### 2. Dependencies

For every import / external interaction, list:
- **Module name / path**
- **What is imported**
- **How it is used**
- Any important expectations, contracts, or assumptions
- Whether the dependency is optional or required

If there are no dependencies, explicitly say so.

Use a bullet list or table for clarity.

---

### 3. Main Functions/Methods

For each important function, method, or class in this file:

- Provide a code-style signature block, for example:

  \`\`\`ts
  function example(
    arg1: string,
    options?: ExampleOptions
  ): Promise<ExampleResult>
  \`\`\`

- Then give a **structured specification** with:

  - **Name**: The identifier used in code.
  - **Signature**: Restate parameters and return type in prose.
  - **Parameters**: For each parameter:
    - Name
    - Type (as precise as possible)
    - Whether required or optional
    - Description and valid ranges / shapes / constraints
  - **Returns**:
    - Type
    - What the value represents
    - Example values where helpful
  - **Behavior**:
    - Step-by-step description of what the function does.
    - How it handles invalid input, edge cases, and errors.
    - Any side effects (I/O, state changes, logging, etc.).
  - **Errors**:
    - What errors/exceptions can be thrown or returned.
    - Under which circumstances.
  - **Examples** (when non-trivial):
    - Short usage snippets in code blocks.

Focus on **how** the logic works, not just a high-level description.

---

### 4. Exports

Document the public API of this file:

- List all named exports and the default export (if any).
- For each export, state:
  - What it is (function, class, constant, type, etc.).
  - Its purpose.
  - Any stability or usage notes (e.g., "internal", "experimental").

This section should allow a developer to understand exactly what consumers
of this module can import.

---

### 5. Implementation Details

This is the most important section for **code regeneration**.

Describe in detail:

- Overall design and patterns used (e.g., functional, OOP, factory, strategy).
- Key algorithms, including:
  - Data structures used.
  - Complexity considerations (time/space).
  - Iteration order, sorting rules, filtering rules, etc.
- How input validation is implemented.
- How errors are handled and propagated.
- Any concurrency/async considerations.
- Any caching or memoization strategies.
- Any important constants, configuration handling, or environment dependencies.
- Edge cases:
  - Empty or null inputs.
  - Invalid types.
  - Boundary values.
  - Rare but important scenarios.
- Any safeguards and constraints that must be preserved in future implementations.

The goal: With this section alone, a strong engineer should be able to
recreate the entire module's source code with the same behavior,
even if they never saw the original implementation.

---

### FDS Characteristics You Must Enforce

- **File-Specific**: Focus solely on a single file/module and what it contains.
- **Technical**: Include types, shapes, and exact behavior.
- **Implementation-Focused**: Describe HOW things are done, not just what.
- **Regeneration-Ready**: Do not omit critical information needed to rebuild
  the code (e.g., error conditions, ordering, data structure choices).
- **Signature-Rich**: Use code blocks for function/method/class signatures.
- **Edge-Case-Aware**: Explicitly mention edge cases and how they are handled.

---

### Output Requirements

- Output must be **Markdown**.
- Include **code blocks** for:
  - Signatures
  - Any usage examples
- Do **not** include any extraneous commentary outside the FDS.
- Stay focused on technical details; avoid marketing or non-technical fluff.

---

## User's FDS Request

The following is the user's original prompt describing the module/file
for which you must generate the FDS. Use it as the primary source of
requirements, and infer reasonable technical details where ambiguous.

User Prompt:
"""
${trimmedUserPrompt}
"""

Now produce the complete FDS in Markdown, following all the rules above.
`.trim();
}

/**
 * Generate File Design Specification (FDS) content using an injected LLM agent.
 *
 * @async
 * @param {object} options
 * @param {string} options.prompt - User instructions for FDS generation.
 * @param {object} options.llmAgent - LLM agent with an executePrompt method.
 *   The agent must support: executePrompt(prompt: string, options?: { mode?: string }): Promise<string>
 *
 * @returns {Promise<string>} - Markdown-formatted FDS content.
 *
 * @throws {Error} If prompt or llmAgent is missing or invalid.
 */
export async function generateFds({ prompt, llmAgent } = {}) {
  validateOptions({ prompt, llmAgent });

  const technicalPrompt = buildTechnicalPrompt(prompt);

  const response = await llmAgent.executePrompt(technicalPrompt, {
    mode: 'deep',
  });

  if (typeof response !== 'string') {
    throw new Error(
      'fdsExpert: llmAgent.executePrompt must resolve to a string response.'
    );
  }

  return response.trim();
}

export async function action(context) {
  const { llmAgent, recursiveAgent, ...args } = context;
  
  // If we have structured args already, use them directly
  if (args.prompt) {
    return await generateFds({ prompt: args.prompt, llmAgent });
  }
  
  // Otherwise, resolve from natural language input
  const prompt = args.input || Object.values(args)[0];
  if (!prompt) {
    throw new Error('No input provided for fds-expert operation');
  }
  
  const schema = ['prompt'];
  const regexPatterns = [
    /generate\s+fds\s+(?:content\s+)?(?:for\s+)?(.+)/i,
    /create\s+(?:a\s+)?fds\s+(?:for\s+)?(.+)/i,
    /write\s+fds\s+(?:content\s+)?(?:for\s+)?(.+)/i,
  ];
  
  const resolvedArgs = await resolveArguments(
    llmAgent,
    prompt,
    'Extract FDS generation prompt',
    schema,
    regexPatterns
  );
  
  const [fdsPrompt] = resolvedArgs;
  return await generateFds({ prompt: fdsPrompt || prompt, llmAgent });
}

/**
 * Default exported skill object for convenience, exposing a single `run` method.
 *
 * Example usage:
 *
 * ```js
 * import fdsExpert from './index.mjs';
 *
 * const markdown = await fdsExpert.run({ prompt: 'Describe myModule.js', llmAgent });
 * ```
 */
const fdsExpert = {
  /**
   * Run the FDS expert generator.
   *
   * @param {object} options
   * @param {string} options.prompt
   * @param {object} options.llmAgent
   * @returns {Promise<string>}
   */
  async run(options) {
    return generateFds(options);
  },
};

export default fdsExpert;