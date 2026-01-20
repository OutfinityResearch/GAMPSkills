# Scan Directory Skill Specification

## Overview
This skill lists files in a root directory, applying include and exclude filters with an option for recursion. It returns an array of relative paths to files matching the criteria. The skill returns the array upon success or throws errors for invalid paths or access denied.

## Interface
- **Input**: A prompt string in the format `"root: /path, include: pattern, exclude: pattern, recursive: true/false"`.
- **Output**: An array of relative file paths.

## Dependencies
- `glob` (for pattern matching).
- `node:path` (for path manipulation).