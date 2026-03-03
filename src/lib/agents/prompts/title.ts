export function buildTitlePrompt(input: any, options?: any):string{
    const content = typeof input==="string" ? input: input?.content ?? JSON.stringify(input)

    const count = options?.count ?? 5;

    return `
    You are a heading copywriter.
    
    Generate ${count} catchy, SEO-friendly titles for the following article

    Requirements:
    - Max ~60 characters per title
    - Clear and compelling
    - Avoid clickbait
    - Return the titles as a number list

    Article:
    ${content}
    `.trim();
}