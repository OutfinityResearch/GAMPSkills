# Documentation Structure Requirements

This skill enforces a standard documentation layout under `docs/` with a specs subfolder. The goal is to normalize existing documentation into a consistent, navigable structure.

## Required Layout

- `docs/index.html`
- `docs/*.html` technical pages derived from existing documentation and code
- `docs/styles.css`
- `docs/assets/` for SVG files and any other documentation assets
- `docs/partials/` with shared fragments (header/footer)
- `docs/partials-loader.js`
- `docs/specs/` with DSXX-named specifications
- `docs/specs/matrix.md` that maps to the other spec files
- `docs/specsLoader.html` (copied from the skill asset)

## HTML Pages

- Page names must follow the actual content of the codebase and/or existing documentation.
- There is no fixed list of required page names; derive the set of pages from the project's domains, components, and responsibilities.
- Each page must be written in English, use a technical writing style, and keep code samples minimal.
- Keep SVG files and any other assets outside the HTML files and store them under `docs/assets/`.
- Follow `technical-docs-guidelines.md` for HTML writing, editorial, and presentation rules.

## Specs Folder Rules

- Files must follow `DSXX-Name.md` naming, e.g. `DS01-Vision.md`.
- `matrix.md` must link DS files in the format `- [DS01 - Vision](specsLoader.html?spec=DS01-Vision.md)`.
- No DS file is mandatory by default; create the DS set that matches project scope.
- Add additional DS files only when scope requires it.
- Keep specs focused on rules, constraints, and invariants. Prefer narrative requirement-style sections over long bullet lists.
- Follow `specs-guidelines.md` for DS writing and contract rules.

## Specs Loader

- Always copy the skill asset `assets/specsLoader.html` to `docs/specsLoader.html`.
- The specs loader must be able to open `specs/matrix.md` via `specsLoader.html?spec=matrix.md`.

## Content Expectations

- The HTML docs must describe the system in operational terms: components, responsibilities, interfaces, and runtime behaviors.
- Preserve any system narrative or agent-role requirements found in `AGENTS.md` or existing docs.
