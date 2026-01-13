# Init Project Skill (cskill)

## Goal
Provide a cskill compatible with RecursiveSkilledAgent that initializes project docs/spec backlogs and asks for missing spec details using an injected llmAgent.

## Scope
- Use cskill descriptor (`cskill.md`) and specs/index.mjs.md for code generation.
- Input: plain string where first token is `targetDir`, remaining text is optional `prompt`.
- Create directories: `docs/`, `docs/specs/`, `docs/gamp`, `docs/specs/src`, `docs/specs/tests` (idempotent).
- Build prompt from optional `prompt` and call `llmAgent.executePrompt` (json) to populate backlog.
- Overwrite `docs/specs_backlog.m` (project-questions section) and write `docs/docs_backlog` with static placeholder.

## Input Contract (plain string)
- First token: targetDir (absolute or relative to cwd).
- Remaining tokens joined: prompt (may be empty).

## Behavior
1) Resolve targetDir vs current working directory.
2) Ensure targetDir exists (create if missing).
3) Create required directories.
4) Build LLM prompt from provided prompt text; call llmAgent for JSON (status/issues/proposed fixes).
5) Write `docs/specs_backlog.m` (overwrite) and `docs/docs_backlog` (static text).
6) Return summary string with relative backlog paths.

## Constraints
- No LLMAgent instantiation; use injected `recursiveSkilledAgent.llmAgent`.
- No CLI runner; invoked via RecursiveSkilledAgent.

