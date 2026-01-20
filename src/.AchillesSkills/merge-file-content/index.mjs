import { readFile } from 'node:fs/promises';

export async function action(context) {
    const { prompt: userPrompt, llmAgent } = context;
    const match = userPrompt.match(/path:\s*(.+),\s*currentContent:\s*(.+),\s*instructions:\s*(.+)/s);
    if (!match) throw new Error('Invalid prompt format for merge-file-content: expected "path: /path, currentContent: text, instructions: text"');
    const path = match[1].trim();
    const currentContent = match[2].trim();
    const instructions = match[3].trim();
    const prompt = `Apply the following instructions to the file content: ${instructions}. Current content: ${currentContent}`;
    const response = await llmAgent.executePrompt(prompt, { mode: 'deep' });
    return response.trim();
}