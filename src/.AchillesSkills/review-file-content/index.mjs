import { readFile } from 'node:fs/promises';

export async function action(context) {
    const { prompt: userPrompt, llmAgent } = context;
    const match = userPrompt.match(/path:\s*(.+),\s*content:\s*(.+),\s*context:\s*(.+)/s);
    if (!match) throw new Error('Invalid prompt format for review-file-content: expected "path: /path, content: text, context: text"');
    const path = match[1].trim();
    const content = match[2].trim();
    const contextStr = match[3].trim();
    const prompt = `Review this file content for consistency and issues: ${content}. Context: ${contextStr}`;
    const response = await llmAgent.executePrompt(prompt, { mode: 'deep' });
    const feedback = JSON.parse(response); // Assume LLM returns JSON
    return feedback;
}