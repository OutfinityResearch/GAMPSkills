import { buildSourceFilesListing } from './prompt-utils.mjs';

function buildTestFilePrompt({ description, sourceFiles, fdsContent }) {
    const sourceFilesListing = buildSourceFilesListing(sourceFiles);
    return `
# Test File Generation

You are an expert JavaScript test author. Generate one executable UNIT test file based on the described plan.
The test file must be runnable with Node.js (ESM) and must write JSON results to stdout.
Focus on unit tests for the target module. Do not create integration or cross-file tests. Avoid mocks or stubs unless a dependency cannot be executed locally (e.g., requires network access, credentials, or a non-deterministic external service). If a mock is absolutely required, keep it minimal, explain it in code comments, and only mock the smallest surface necessary.
Infer input formats, option syntax, and path handling from the source code itself. Do not invent new formats or behaviors that are not present in the code.
If the tests need test cases/fixtures files on disk, include them as fixtures in the JSON output so they can be written persistently under the repo (prefer tests/fixtures/... or a clearly stated tests/ subtree).

## Below is the description of the test that needs to be implemented:
${description}

## Full FDS (with dependency descriptions injected):
${fdsContent}

## Below are source code files that need to be tested:
${sourceFilesListing}

## Output Format (STRICT JSON ONLY)
{
  "fileName": "path/to/test-file.mjs",
  "content": "full test file content",
  "fixtures": [
    {
      "path": "tests/fixtures/example.txt",
      "content": "fixture file contents"
    }
  ]
}

Rules:
- Return ONLY a single JSON object, no markdown fences or extra text.
- The test file will be written under the tests/ directory using the provided fileName.
- The test file MUST produce a results array and MUST write it to stdout exactly as JSON:
  process.stdout.write(JSON.stringify({ results }));
- Each results entry MUST include:
  - expected: any JSON value
  - actual: any JSON value
  - pass: boolean
- Do not include an "error" field in results entries. Use pass=false with expected/actual for mismatches.
- Do not write any other stdout output.
- If fixtures are needed, return them in the "fixtures" array. Each fixture must include a repo-relative path and UTF-8 text content.
- Keep fixture paths stable and explicit (avoid temp dirs) so the tests can run consistently in CI.
- If you cannot produce tests, still return a JSON object with "fileName" and "content", and an empty fixtures array.
`;
}

export { buildTestFilePrompt };
