export async function action(context) {
    const { prompt: userPrompt, llmAgent } = context;
    const match = userPrompt.match(/prompt:\s*(.+),\s*context:\s*(.+),\s*mode:\s*(.+)/s);
    if (!match) throw new Error('Invalid prompt format for generate-text: expected "prompt: text, context: text, mode: deep|fast"');
    const prompt = match[1].trim();
    const contextStr = match[2].trim();
    const mode = match[3].trim();
    const response = await llmAgent.executePrompt(prompt, { mode, context: contextStr });
    return response;
}