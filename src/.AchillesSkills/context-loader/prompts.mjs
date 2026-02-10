/**
 * Asks the LLM which files to read, given the directory tree and optional current context.
 * Injects constraints from options into the prompt.
 */
export async function askLLMForFiles(llmAgent, userRequest, directoryTree, currentContext, constraints) {
    const prompt = currentContext
        ? buildFollowUpPrompt(userRequest, directoryTree, currentContext, constraints)
        : buildInitialPrompt(userRequest, directoryTree, constraints);

    const response = await llmAgent.executePrompt(prompt, {
        mode: 'fast',
        responseShape: 'json',
    });

    return parseResponse(response);
}

/**
 * Builds the constraints section for LLM prompts based on active options.
 * @param {object} options - parsed options
 * @returns {string} - constraints text or empty string
 */
export function buildConstraintsSection(options) {
    const lines = [];

    if (options.filter) {
        lines.push(`- ONLY select files whose name matches the pattern: ${options.filter}`);
    }
    if (options.exclude) {
        lines.push(`- Do NOT select files whose name matches the pattern: ${options.exclude}`);
    }
    if (options.maxFiles !== null) {
        lines.push(`- Maximum ${options.maxFiles} files can be read in total. Be selective.`);
    }
    if (options.include && options.include.length > 0) {
        lines.push(`- The following files are already force-included and loaded. Do NOT request them again: ${options.include.join(', ')}`);
    }
    if (options.dir && options.dir !== '.') {
        lines.push(`- Only select files within the directory: ${options.dir}`);
    }

    if (lines.length === 0) return '';
    return `\n## Active Constraints\n${lines.join('\n')}\n`;
}

function buildInitialPrompt(userRequest, directoryTree, constraints) {
    const constraintsSection = constraints || '';

    return `You are a context-loading assistant. Your job is to determine which files from a project should be read to provide sufficient context for the following request.

## Request
"""
${userRequest}
"""

## Project Directory Structure
"""
${directoryTree}
"""
${constraintsSection}
## Instructions
- Analyze the request and the directory structure.
- Select the files that are most relevant to understanding the request.
- Start with the most critical files (entry points, configs, directly referenced files).
- Do NOT select binary files, images, lock files (package-lock.json, yarn.lock), or generated files.
- Select a reasonable number of files (typically 3-8 for the first batch).
- Use exact paths as shown in the directory structure.

## Response Format
Respond ONLY with a JSON object (no markdown, no explanation outside JSON):
{
  "done": false,
  "files": ["path/to/file1.ts", "path/to/file2.ts"],
  "reason": "Brief explanation of why these files are needed"
}

If the directory structure alone is sufficient and no files need reading, respond:
{
  "done": true,
  "files": [],
  "reason": "Explanation"
}`;
}

function buildFollowUpPrompt(userRequest, directoryTree, currentContext, constraints) {
    const constraintsSection = constraints || '';

    return `You are a context-loading assistant. You have already read some files and need to decide if more files are needed.

## Original Request
"""
${userRequest}
"""

## Project Directory Structure
"""
${directoryTree}
"""

## Already Loaded Context
${currentContext}
${constraintsSection}
## Instructions
- Review the already loaded context above.
- Determine if additional files are needed to fully understand the request.
- If references, imports, or dependencies point to files not yet read, include them.
- Do NOT re-request files already loaded in the context above.
- If the context is sufficient, mark as done.

## Response Format
Respond ONLY with a JSON object (no markdown, no explanation outside JSON):
{
  "done": true,
  "files": [],
  "reason": "Context is sufficient because..."
}

Or if more files are needed:
{
  "done": false,
  "files": ["path/to/additional/file.ts"],
  "reason": "Need to read these because..."
}`;
}

function parseResponse(response) {
    // If already an object (responseShape: 'json' worked)
    if (typeof response === 'object' && response !== null) {
        return normalizeResponse(response);
    }

    // Try to extract JSON from string response
    if (typeof response === 'string') {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return normalizeResponse(parsed);
            }
        } catch { /* fall through */ }
    }

    // Fallback: could not parse, stop iteration
    return { done: true, files: [], reason: 'Could not parse LLM response.' };
}

function normalizeResponse(obj) {
    return {
        done: Boolean(obj.done),
        files: Array.isArray(obj.files)
            ? obj.files.filter(f => typeof f === 'string' && f.trim().length > 0)
            : [],
        reason: typeof obj.reason === 'string' ? obj.reason : '',
    };
}
