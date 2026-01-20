import BacklogManager from '../BacklogManager.mjs';

export async function action(context) {
    const { prompt: userPrompt, llmAgent } = context;
    const match = userPrompt.match(/section:\s*(.+),\s*context:\s*(.+)/s);
    if (!match) throw new Error('Invalid prompt format for review-backlog-section: expected "section: obj, context: text"');
    const sectionJson = match[1].trim();
    const contextStr = match[2].trim();
    const section = JSON.parse(sectionJson);
    const prompt = `Review this backlog section for coherence and completeness: ${JSON.stringify(section)}. Context: ${contextStr}`;
    const response = await llmAgent.executePrompt(prompt, { mode: 'deep' });
    const feedback = JSON.parse(response); // Assume LLM returns JSON
    return feedback;
}