export function buildSummarizePrompt(input: any, options?: any):string{
    const content  = typeof input === "string" ? input : input?.content ?? JSON.stringify(input, null, 2);

    const length = options?.length ?? "short";

    const instructions = 
    length === "short" 
      ? "1-2 sentences"
      : length === "medium"
      ? "1 short paragraph (3-5 sentences)"
      : "3-3 short paragraphs";

    return `
    You are a summarization assistant.

    Summarize the following contnent in ${instructions}.

    Content:
    ${content}
    `.trim();
}