import { parseInput, applyDefaults } from './parser.mjs';
import { listDirectory } from './listing.mjs';
import { readRequestedFiles, readIncludeFiles, buildContextAssignString } from './context.mjs';
import { askLLMForFiles, buildConstraintsSection } from './prompts.mjs';

const MAX_ITERATIONS = 5;

export async function action(context) {
    const { llmAgent, promptText } = context;

    // Step 1: Parse input into prompt + options
    const { prompt, options, parseError } = parseInput(promptText);
    let resolvedOptions = options;

    if (parseError) {
        resolvedOptions = applyDefaults({});
    }

    if (!prompt) {
        throw new Error('No input provided for context-loader.');
    }

    const readFiles = new Map();

    // Step 2: Force-read include files before anything else
    if (resolvedOptions.include) {
        await readIncludeFiles(resolvedOptions.include, readFiles, resolvedOptions);
    }

    // Step 3: Get filtered directory listing
    const dirListing = await listDirectory(resolvedOptions);
    const treeText = dirListing.join('\n');

    // Step 4: Build constraints section for LLM prompts
    const constraints = buildConstraintsSection(resolvedOptions);

    // Step 5: Iterative LLM-guided file reading
    let iteration = 0;
    let llmResponse = await askLLMForFiles(llmAgent, prompt, treeText, null, constraints);

    while (!llmResponse.done && iteration < MAX_ITERATIONS) {
        iteration++;

        // Enforce maxFiles cap before reading
        if (resolvedOptions.maxFiles !== null && readFiles.size >= resolvedOptions.maxFiles) break;

        // Read requested files (respects filter, maxFiles, maxFileSize)
        await readRequestedFiles(llmResponse.files, readFiles, resolvedOptions);

        // Build accumulated context
        const contextAssigns = buildContextAssignString(readFiles);

        // Ask LLM if more files are needed
        llmResponse = await askLLMForFiles(llmAgent, prompt, treeText, contextAssigns, constraints);
    }

    return buildContextAssignString(readFiles);
}
