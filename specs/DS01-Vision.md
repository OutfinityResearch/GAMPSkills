# DS01 – Vision

## Overview
GAMPSkills is a curated set of reusable skills for AchillesCLI that lets users build software projects through specification-driven development. The project’s documentation lives in `./docs`, and its specifications reside under `./docs/specs`, where DS files serve as the single source of truth. Clear specifications enable code regeneration whenever needed, even if existing code drifts or becomes messy.

## What is Specification-Driven Development
Specification-driven development treats specifications as the primary artifact, describing intent, scope, interfaces, constraints, and quality bars. Code is generated from these specs and can be regenerated at any point, which means recovery remains possible as long as the specs stay correct. The workflow puts clarity first and code second, allowing specs to evolve collaboratively while code follows their guidance.

## Audience
GAMPSkills targets technically inclined users who may not be programmers and should not need to learn a programming language to deliver software with this system. It also serves professional developers who want faster bootstrapping and reliable regeneration from well-defined specifications.

## Role in AchillesCLI
AchillesCLI uses GAMPSkills to guide users from an initial project idea to a set of global DS files that capture vision, governance, and key decisions. Additional GAMPSkills then help produce more specific DS documents—covering technology choices, APIs, UI contracts, data flows, and other details—that refine the project and drive code generation.

## Vision
The process starts from a general idea and collaboratively shapes a set of global DS documents that capture the project’s identity, constraints, and success criteria. It then derives more specific DS documents for technical detail—stack, interfaces, APIs, data, UI flows—before generating code. Regeneration remains possible at any time because accurate DS documents let the project rebuild or refresh its code whenever needed, emphasizing consistency, clarity, and traceability from idea to specs to code.

## Principles
This vision prefers specification-driven development over ad-hoc coding and treats specs as the living contract and regeneration backbone. It advances through incremental refinement from global DS to specific DS and then to code. It values transparency and resilience, keeping the specs as the carrier of truth so code can always be rebuilt from them.

## Outcomes
The approach establishes a reliable DS backbone that defines what the project is and what it can do. It enables repeatable code generation aligned to the latest specifications and reduces dependence on individual coding skill by focusing on well-structured intent.

## Next Steps
The next steps are to create the remaining global DS files (DS02–DS06) for backlog management, structure, review practices, documentation review, and skills inventory. Afterward, more specific DS documents for technology, APIs, UI, data, and deployment can drive full code generation.
