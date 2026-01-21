export async function action(context) {
    const { generationPrompt, context: contextStr = '', mode = 'fast', llmAgent } = context;
    if (!generationPrompt) {
        throw new Error('Invalid input for generate-text: expected generationPrompt.');
    }
    const response = await llmAgent.executePrompt(generationPrompt, { mode, context: contextStr });
    return response;
}
