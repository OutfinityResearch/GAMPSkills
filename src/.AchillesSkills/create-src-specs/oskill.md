# Create Source Specs

## Summary
Generates detailed technical FDS specification files under `./docs/specs/src/` that mirror the planned `./src/` implementation structure. Uses global specs from `./docs/specs/` as context and the user prompt to produce per-file specifications describing exposed functions, inputs/outputs, dependencies, and links to related test specs.

## Instructions
This skill reads global FDS files from `./docs/specs/` (excluding `src/` and `tests/` subdirectories and hidden files), combines them with the user prompt, and invokes the LLM to generate technical specifications for source files.

The LLM response must be in markdown format with each file delimited by a line starting with `<!-- FILE: path/to/file.md -->`. Everything following that marker until the next marker (or end of response) is the content for that file. Paths are relative to `./docs/specs/src/`.

Example response format:
```
<!-- FILE: utils/logger.md -->
# Logger Utility

## Purpose
Provides logging functions...

## Exposed Functions
- log(level, message)
...

<!-- FILE: core/engine.md -->
# Engine Core

## Purpose
...
```

The skill writes each parsed file to `./docs/specs/src/<path>`, creating directories as needed and overwriting existing files. It returns a summary of written files.
