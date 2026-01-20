export async function action(context) {
    const { prompt: userPrompt, llmAgent } = context;
    const match = userPrompt.match(/content:\s*(.+),\s*feedback:\s*(.+)/s);
    if (!match) throw new Error('Invalid prompt format for iterate-on-feedback: expected "content: text, feedback: obj"');
    const originalContent = match[1].trim();
    const feedbackJson = match[2].trim();
    const feedback = JSON.parse(feedbackJson);
    const prompt = `Refine the following content based on this feedback: ${JSON.stringify(feedback)}. Content: ${originalContent}`;
    const response = await llmAgent.executePrompt(prompt, { mode: 'deep' });
    return response.trim();
}