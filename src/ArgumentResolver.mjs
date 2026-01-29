/**
 * Unified argument resolution for cskills: regex patterns, heuristics, then LLM fallback
 */
export async function resolveArguments(agent, prompt, instruction, schema, regexPatterns = []) {
    const isLoop = !!agent.currentSession;
    const input = prompt;

    const debugEnabled = process.env.AGENTIC_DEBUG === 'true';
    const debugLog = (...args) => {
        if (debugEnabled) {
            console.log(...args);
        }
    };

    debugLog(`[resolveArguments] isLoop=${isLoop}, prompt=${JSON.stringify(input)}, instruction="${instruction}"`);

    // 1) Structured inputs (arrays) — preserve SOP-friendly handling
    if (Array.isArray(input)) {
        const parts = input.map((value) => (value === null || value === undefined ? '' : String(value)));
        if (!parts.length) {
            return [];
        }
        if (parts.length >= schema.length) {
            if (schema.length === 1) {
                return [parts.join(' ')];
            }
            if (parts.length > schema.length) {
                const head = parts.slice(0, schema.length - 1);
                const tail = parts.slice(schema.length - 1).join(' ');
                return head.concat([tail]);
            }
            return parts.slice(0, schema.length);
        }
    }

    const textInput = String(input ?? '').trim();
    if (!textInput) {
        return [];
    }

    // 2) Regex first (now for both SOP and Loop)
    for (const pattern of regexPatterns) {
        const match = textInput.match(pattern);
        if (match) {
            const captured = match.slice(1);
            if (captured.length >= schema.length) {
                debugLog(`[resolveArguments] Regex matched: ${pattern}`);
                return captured.map((c) => c.trim());
            }
        }
    }

    // 2b) Single-argument tools: keep the full string intact
    if (schema.length <= 1) {
        return [textInput];
    }

    // 3) Heuristics: commas, whitespace, numeric lists
    const commaParts = textInput.split(',').map((x) => x.trim()).filter(Boolean);
    if (commaParts.length > 1) {
        const numericOnly = commaParts.every((p) => !Number.isNaN(Number.parseFloat(p)));
        if (numericOnly || commaParts.length >= schema.length) {
            if (schema.length === 2 && commaParts.length > 2) {
                const [first, ...rest] = commaParts;
                return [first, rest.join(' ')];
            }
            return commaParts.slice(0, schema.length);
        }
    }

    const parts = textInput.split(/\s+/).filter(Boolean);
    if (parts.length >= schema.length) {
        if (schema.length === 2 && parts.length > 2) {
            const [first, ...rest] = parts;
            return [first, rest.join(' ')];
        }
        return parts.slice(0, schema.length);
    }

    if (schema.length <= 1) {
        return [textInput];
    }

    // 4) LLM extraction fallback (both modes)
    const llmExtracted = await extractArgumentsWithLLM(agent, prompt, instruction, schema);
    if (Array.isArray(llmExtracted)) {
        debugLog(`[resolveArguments] LLM extraction success: ${JSON.stringify(llmExtracted)}`);
        return llmExtracted;
    }

    // 5) Last resort: return whole prompt
    return [String(prompt ?? '')];
}

export async function extractArgumentsWithLLM(agent, prompt, instruction, schema) {
    const extractionPrompt = [
        'You are an argument extractor.',
        `Task: ${instruction}`,
        'Extract the arguments from the following user prompt.',
        `Return ONLY a JSON array of strings/numbers matching this schema: ${JSON.stringify(schema)}`,
        'Do not explain.',
        '',
        `Prompt: ${prompt}`,
    ].join('\n');

    const result = await agent.complete({
        prompt: extractionPrompt,
        mode: 'fast',
        context: { intent: 'cskill-extract-args' },
    });

    try {
        const parsed = JSON.parse(result);
        if (Array.isArray(parsed)) {
            return parsed;
        }
    } catch (e) {
        // ignore parse errors, fall back
    }

    return null;
}
