# DS03 – Specs Structure

## Overview
This document describes how a project managed by GAMPSkills is organized so that specifications remain the primary source of truth. Project documentation lives in `./docs`, and all specification assets reside under `./docs/specs`. The project root also contains the `specs_backlog.md` file (at `./specs_backlog.md`) where tasks and proposed fixes are tracked for every specification file.

## Global Specs in `./docs/specs/`
Within `./docs/specs/`, global DS files capture the overarching vision of the project: what the project aims to achieve, who the target audience is, what major components exist, and how the overall flow of work should run. These documents remain high-level and universal so that any generated code can stay aligned with the core intent of the project.

## Local/Technical Specs in `./docs/specs/src/`
The `./docs/specs/src/` directory holds specific, technical FDS documents that drive concrete code generation. For every FDS file placed here, there is a corresponding implemented file in `./src/`, mirroring the structure and naming so that each specification maps cleanly to its implementation. These FDS files stay in natural language (with diagrams or tables if useful) and avoid code except when a behavior cannot be expressed otherwise. Each local FDS should state its dependencies—both other FDS files and external/native libraries—along with the main methods it defines or influences, the expected inputs and outputs, and any notable constraints or assumptions. Additional contextual details (interfaces, data shapes, failure modes, etc.) should be included whenever they improve clarity.

## Test Specs in `./docs/specs/tests/`
The `./docs/specs/tests/` directory contains FDS documents that describe tests in natural language. Each test spec explains what the test validates, which global DS or local FDS files it relates to, what assertions and inputs/outputs are expected, and which behaviors are being verified. These documents may use diagrams or tables but should avoid code unless it is the only precise way to convey intent. Test specs are typically produced by the create-tests-specs skill and kept alongside the implementation-mirroring structure in `./docs/specs/src/`.

## Backlog at `./specs_backlog.md`
The backlog lives at the project root as `specs_backlog.md` and aggregates specification tasks and proposed options. It anchors the review-and-approval loop described in DS02, keeping work on specification files transparent and coordinated across global DS, local FDS, and test FDS files.

## How the Pieces Fit Together
Global DS files set the direction and boundaries. Local FDS files in `./docs/specs/src/` translate that direction into actionable, implementation-ready guidance that mirrors the structure of `./src/`. Test FDS files in `./docs/specs/tests/` mirror the structure of `./tests/` so each test spec maps directly to a generated test. The external AchillesCLI dynamic code generation skill expects a target folder containing a `/specs` subfolder with the specifications and mirrors that structure one-to-one when generating implementation code and tests, producing corresponding files under `./src/` and `./tests/`. The backlog at `./specs_backlog.md` ties everything together by recording tasks and approved improvements, ensuring changes to specifications—and the code they generate—remain deliberate and traceable.
