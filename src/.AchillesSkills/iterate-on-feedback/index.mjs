export async function action(context) {
    const { content, feedback, llmAgent } = context;
    if (!content || !feedback) {
        throw new Error('Invalid input for iterate-on-feedback: expected content and feedback.');
    }
    const prompt = `Refine the following content based on this feedback: ${JSON.stringify(feedback)}. Content: ${content}`;
    const response = await llmAgent.executePrompt(prompt, { mode: 'deep' });
    return response.trim();
}
