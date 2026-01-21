export async function action(context) {
    const { content, criteria = '', llmAgent } = context;
    if (!content) {
        throw new Error('Invalid input for review-text: expected content.');
    }
    const prompt = `Analyze this text for quality, gaps, or improvements based on criteria: ${criteria}. Text: ${content}`;
    const response = await llmAgent.executePrompt(prompt, { mode: 'deep' });
    const feedback = JSON.parse(response);
    return feedback;
}
