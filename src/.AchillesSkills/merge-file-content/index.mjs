export async function action(context) {
    const { content, instructions, llmAgent } = context;
    if (!content || !instructions) {
        throw new Error('Invalid input for merge-file-content: expected content and instructions.');
    }
    const prompt = `Apply the following instructions to the file content: ${instructions}. Current content: ${content}`;
    const response = await llmAgent.executePrompt(prompt, { mode: 'deep' });
    return response.trim();
}
