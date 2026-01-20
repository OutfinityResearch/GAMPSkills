import fs from 'node:fs';
import path from 'node:path';

const FILE_MARKER_REGEX = /^<!--\s*FILE:\s*(.+?)\s*-->$/;

function isHidden(name) {
    return name.startsWith('.');
}

async function readGlobalSpecs(specsDir) {
    const results = [];
    if (!fs.existsSync(specsDir)) {
        return results;
    }

    const entries = fs.readdirSync(specsDir, { withFileTypes: true });
    for (const entry of entries) {
        if (isHidden(entry.name)) {
            continue;
        }
        if (entry.name === 'src' || entry.name === 'tests') {
            continue;
        }
        const fullPath = path.join(specsDir, entry.name);
        if (entry.isFile() && entry.name.endsWith('.md') && entry.name.startsWith('DS')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            results.push({ name: entry.name, content });
        }
    }
    return results;
}

function parseFilesFromMarkdown(markdown) {
    const files = [];
    const lines = markdown.split(/\r?\n/);
    let currentPath = null;
    let currentLines = [];

    for (const line of lines) {
        const match = line.match(FILE_MARKER_REGEX);
        if (match) {
            if (currentPath) {
                files.push({ path: currentPath, content: currentLines.join('\n').trim() });
            }
            currentPath = match[1].trim();
            currentLines = [];
        } else if (currentPath !== null) {
            currentLines.push(line);
        }
    }

    if (currentPath) {
        files.push({ path: currentPath, content: currentLines.join('\n').trim() });
    }

    return files;
}

function buildLLMPrompt(userPrompt, globalSpecs) {
    const specsSection = globalSpecs.length
        ? globalSpecs.map(spec => `### ${spec.name}\n${spec.content}`).join('\n\n---\n\n')
        : '<no global specs found>';

    return `# Task: Generate Technical Source Specifications

## User Request
${userPrompt}

## Global Specifications (Context)
${specsSection}

## Instructions
Based on the user request and global specifications above, generate detailed technical FDS (Functional Design Specification) files for the source code implementation.

Each specification file should describe:
- Purpose and responsibilities
- Exposed functions with their signatures
- Inputs and outputs
- Dependencies on other project files or external/native libraries
- Links to related test specifications (if applicable)
- Notable constraints or assumptions

## Response Format
Output each file using this exact format:

<!-- FILE: relative/path/to/file.md -->
[Full markdown content of the specification file]

<!-- FILE: another/path/file.md -->
[Full markdown content]

Paths should be relative and will be written under ./docs/specs/src/.
Do not include code blocks around the entire response. Each file content should be valid markdown.`;
}

export async function action(context) {
    const { prompt, llmAgent } = context;

    if (!prompt || typeof prompt !== 'string') {
        throw new Error('create-src-specs requires a non-empty prompt string.');
    }

    if (!llmAgent || typeof llmAgent.executePrompt !== 'function') {
        throw new Error('create-src-specs requires llmAgent with executePrompt method.');
    }

    const cwd = process.cwd();
    const globalSpecsDir = path.join(cwd, 'docs', 'specs');
    const targetDir = path.join(cwd, 'docs', 'specs', 'src');

    const globalSpecs = await readGlobalSpecs(globalSpecsDir);

    const llmPrompt = buildLLMPrompt(prompt, globalSpecs);

    const response = await llmAgent.executePrompt(llmPrompt, {
        mode: 'deep',
        context: {
            intent: 'generate-src-specs',
            skillName: 'create-src-specs',
        },
    });

    const rawMarkdown = typeof response === 'string' ? response : (response?.content || response?.text || '');

    if (!rawMarkdown.trim()) {
        throw new Error('LLM returned empty response.');
    }

    const files = parseFilesFromMarkdown(rawMarkdown);

    if (!files.length) {
        throw new Error('No files parsed from LLM response. Ensure response uses <!-- FILE: path --> markers.');
    }

    const written = [];

    for (const file of files) {
        const sanitizedPath = file.path.replace(/^[/\\]+/, '').replace(/\.\./g, '');
        const fullPath = path.join(targetDir, sanitizedPath);
        const dir = path.dirname(fullPath);

        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fullPath, file.content, 'utf8');
        written.push(sanitizedPath);
    }

    return `Generated ${written.length} files: ${written.join(', ')}.`;
}
