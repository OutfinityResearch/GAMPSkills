export async function action(context) {
    const { section, context: contextStr = '', llmAgent } = context;
    if (!section) {
        throw new Error('Invalid input for review-backlog-section: expected section.');
    }
    const prompt = `Review this backlog section for coherence and completeness: ${JSON.stringify(section)}. Context: ${contextStr}`;
    const response = await llmAgent.executePrompt(prompt, { mode: 'deep' });
    const feedback = JSON.parse(response);
    return feedback;
}
