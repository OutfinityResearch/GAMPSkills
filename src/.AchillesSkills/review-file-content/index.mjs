export async function action(context) {
    const { content, context: contextStr = '', llmAgent } = context;
    if (!content) {
        throw new Error('Invalid input for review-file-content: expected content.');
    }
    const prompt = `Review this file content for consistency and issues: ${content}. Context: ${contextStr}`;
    const response = await llmAgent.executePrompt(prompt, { mode: 'deep' });
    const feedback = JSON.parse(response);
    return feedback;
}
