export async function action(context) {
    const { prompt, llmAgent } = context;
    if (!prompt || !llmAgent) {
        throw new Error('Invalid input: prompt and llmAgent are required.');
    }

    const technicalPrompt = `You are a Design Specification (DS) expert. Your task is to generate high-level, strategic specification content.

DS FORMAT AND STRUCTURE:
- DS files capture global vision, goals, and feature descriptions
- They focus on WHAT the system does and WHY, not HOW
- No code, no technical implementation details, no APIs
- Use clear sections: Overview, Purpose, Role, Vision, Principles, Outcomes
- Content should be strategic and accessible to non-technical stakeholders

DS CHARACTERISTICS:
- Global scope: describes entire systems, workflows, or major components
- Vision-oriented: explains the big picture and intended outcomes
- Non-technical: avoids implementation details, focuses on capabilities
- Strategic: defines success criteria, constraints, and key decisions

EXAMPLES OF DS TOPICS:
- Project vision and goals
- Backlog management approach
- Specification structure and workflow
- Review processes and governance
- Skill conventions and organization

USER REQUEST:
${prompt}

Generate DS content following the format and principles above. Use Markdown with clear headings.`;

    const response = await llmAgent.executePrompt(technicalPrompt, { mode: 'deep' });
    return response.trim();
}
