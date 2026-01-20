export async function action(context) {
    const { prompt: userPrompt, llmAgent } = context;
    const match = userPrompt.match(/content:\s*(.+),\s*criteria:\s*(.+)/s);
    if (!match) throw new Error('Invalid prompt format for review-text: expected "content: text, criteria: text"');
    const content = match[1].trim();
    const criteria = match[2].trim();
    const prompt = `Analyze this text for quality, gaps, or improvements based on criteria: ${criteria}. Text: ${content}`;
    const response = await llmAgent.executePrompt(prompt, { mode: 'deep' });
    const feedback = JSON.parse(response); // Assume LLM returns JSON
    return feedback;
}