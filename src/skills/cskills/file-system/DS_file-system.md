# DS: file-system skill

## Vision and Problem Statement
Provide a reliable, minimal file-system skill that executes a small set of file operations predictably. The skill should let other skills read, write, and manage files without exposing arbitrary system access or ambiguous behavior.

## Intended Users and Context of Use
Used by internal code skills and orchestration flows that need a deterministic, text-based file system interface while running in a controlled project workspace. Requests are provided as a single input string.

## Scope and Boundaries
In scope: basic file operations (read, write, append, delete, copy, move), directory listing/creation, and existence checks. Out of scope: permissions management, filesystem watchers, streaming APIs, and any networked or OS-specific storage behaviors.

## Success Criteria
Requests are parsed consistently, execute the intended operation, and return clear success or error messages. Invalid inputs are rejected deterministically. All paths remain project-relative.

## Affected Files
./specs/index.mjs.md - Implements the file-system skill runtime and request parsing. Exports - action entry point for executing operations.
