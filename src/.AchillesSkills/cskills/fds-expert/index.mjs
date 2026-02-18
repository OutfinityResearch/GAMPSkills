
import { stripDependsOn } from '../../../utils/ArgumentResolver.mjs';

export const FDS_STRUCTURE_PROFILE = `An FDS (File Design Specification) is a concise technical blueprint for a single source file. It defines the file’s responsibilities, boundaries, and externally visible contract, so that implementation can be done consistently and reviewed objectively. It is used when you want a file to be created, refactored, or reviewed with clear intent, stable interfaces, and minimal ambiguity.
Use these required sections in this exact order:
Description
Dependencies
Main Functions/Methods
Exports
Implementation Details
Section guidance:
Description: Thoroughly describe the file’s purpose, responsibilities, and role in the system. State the artifact type (e.g., class, utility module, adapter, interface, CLI command, schema, configuration loader) and clarify what the file explicitly does not do.
Dependencies: List all dependencies, separating internal from external. Include exact import paths and explain why each dependency is required. Note any constraints (e.g., no heavy deps, no network I/O, deterministic behavior).
Main Functions/Methods: Enumerate the key functions/methods with their exact names. For each, specify inputs (types, shapes, invariants), outputs, possible errors/exceptions, edge cases, and the expected behavior. Provide sufficient detail to implement correctly, including any algorithms or decision rules when relevant.
Exports: Describe exactly what the file exports and how consumers should use it. Include the public surface area, stability expectations, and any backward-compatibility constraints.
Implementation Details: Provide general implementation rules and constraints such as performance targets, logging/telemetry, error handling conventions, security/privacy considerations, concurrency model, idempotency, and testing expectations.
Include signatures in code blocks for key functions/methods. If a section has no content, explicitly state so.`;

function getFdsExpertPromptTemplate(userPrompt = '') {
  return `You are a File Design Specification (FDS) expert.

Focus on a single code file. Provide implementation-focused, regeneration-ready details.
Do not include code or low-level implementation steps beyond FDS descriptions.

FDS file structure guidance:
${FDS_STRUCTURE_PROFILE}

Guidelines:
- Be technical and file-specific.
- No extra commentary outside the FDS.

User Prompt:
"""
${userPrompt}
"""`;
}

function buildTechnicalPrompt(userPrompt) {
  return getFdsExpertPromptTemplate(userPrompt);
}

async function executeFdsGeneration({ prompt, llmAgent }) {

  const technicalPrompt = buildTechnicalPrompt(prompt);

  const response = await llmAgent.executePrompt(technicalPrompt, {
    mode: 'deep',
  });

  if (typeof response !== 'string') {
    throw new Error('fds-expert: llmAgent.executePrompt must return a string.');
  }

  return response.trim();
}

export async function action(context) {
  const { llmAgent, ...args } = context;
  const resolvedPrompt = stripDependsOn(args.prompt || args.input || Object.values(args)[0]);

  if (!resolvedPrompt) {
    return null;
  }

  return await executeFdsGeneration({ prompt: resolvedPrompt, llmAgent });
}
