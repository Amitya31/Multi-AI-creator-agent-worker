export function buildOutlinePrompt(topicOrInput: any, options: any):string{
    const topic = typeof topicOrInput === "string" ? topicOrInput : topicOrInput?.prompt ?? JSON.stringify(topicOrInput,null,2);

    const sections = options?.sections ?? 5;

    return `
    You are an expert content strategist.

    Generate a clear, hierarchial outline for a long-form article.

    Requirements:
    -Main Title
    -${sections}-${sections + 2} main sections
    -Each section with 2-4 bullet points
    -focus on logical flow and coverage
    -DO NOT write full article, only the outline

    Topic / Request: 
    ${topic}
    `.trim();
}