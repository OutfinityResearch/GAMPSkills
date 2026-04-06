# DS Specifications Guidelines

Use this reference when writing or revising the specification files under `docs/specs/*.md`.

## Purpose

Write DS specifications as stable agent-facing contracts. Focus on rules, constraints, invariants, and required outcomes rather than implementation history.

## Normative Vocabulary

- Interpret `must` as a mandatory requirement.
- Interpret `should` as a strong recommendation.
- Interpret `may` as permitted but optional behavior.

## Scope And Framing

- Treat `docs/specs/*.md` as specification documents, not as explanatory HTML documentation rewritten in Markdown.
- Keep the same architectural story as the HTML documentation when the project defines one, but express it as obligations, boundaries, and guarantees.
- Use architecture as context only; translate it into responsibilities, boundaries, invariants, and observable guarantees.
- Describe what the system, agent, or interface must do, what it must preserve, and what it must not assume.
- Prefer explicit negative constraints when they prevent future drift.
- Avoid narrating historical steps, migration stories, or implementation diaries unless the scope explicitly requires them.

## Structure Rules

- Follow the `DSXX-Name.md` naming convention.
- Always include `DS01-Vision` and `DS02-Architecture` when the repository guidance requires them.
- Add further DS files only when the scope requires additional contracts.
- Keep the set of specifications proportionate to the real scope of the repository.
- Create a separate DS file only when a distinct boundary, contract surface, or invariant set cannot be expressed cleanly inside an existing DS file.
- Prefer stable section headings that remain meaningful as the implementation evolves.
- Ensure the overall DS set covers, as relevant to the repository, scope and boundaries, obligations, invariants, disallowed assumptions, interfaces or dependencies, and failure or edge behavior.
- Do not restate the same contract in multiple DS files unless one file is explicitly the source of truth and the other references it.

## Writing Standard

- Keep the prose in English.
- Prefer narrative requirement-style sections over long bullet-heavy formatting.
- Use complete sentences that express constraints and invariants clearly.
- Use lists only when the content is genuinely list-shaped, such as enumerating bounded rules or interfaces.
- Reuse stable project terminology rather than inventing a parallel taxonomy for the specs.
- Keep identifiers, filenames, module names, and exact technical terms unchanged.
- Avoid timeline narratives.
- Avoid describing current implementation quirks as long-term guarantees.
- Avoid restating code flow when a rule or invariant is sufficient.
- Avoid creating conceptual categories not present in the project terminology.

## Technical Fidelity

- Ground each requirement in the codebase, repository guidance, or confirmed system behavior.
- Ensure each substantial requirement is defensible from code, repository guidance, or confirmed behavior.
- Where useful, include a short inline basis statement without turning the specification into commentary.
- If code behavior, repository guidance, and documentation disagree, prefer the most authoritative and currently defensible source, and avoid synthesizing a stronger contract than the evidence supports.
- Do not introduce speculative guarantees or contracts that the repository does not support.
- When the repository does not support a strong claim, prefer a narrower statement or mark the point as unresolved rather than inferring intent.
- When a conflict cannot be resolved confidently, state the narrower contract and mark the inconsistency explicitly.
- If a behavior is still implementation-dependent or unresolved, phrase the specification narrowly enough to stay defensible.
- If a contract cannot be stated confidently, record only the defensible subset and leave unresolved points out of scope or mark them explicitly as open.
- Distinguish carefully between mandatory behavior and descriptive context.
- The agent must not infer cross-module guarantees that are not explicitly established.

## Default Outcome

The resulting DS documents should read like durable contracts that guide future work without depending on transient implementation details or decorative explanatory text.
