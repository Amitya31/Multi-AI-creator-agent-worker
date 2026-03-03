export function buildSEOPrompt(input: any, options?: any):string{
    const targetKeyword = options?.keyword ?? options?.primaryKeyword ?? null;

    const content= typeof input==="string" ? input : input?.content ?? JSON.stringify(input, null,2)

    return `
    You are SEO specialist.
    
    Optimize the following article for search engines.

    Requirements:

    - Preserve meaning and tone
    - Improve clarity and readibility
    - Add or refine headings for SEO
    - Suggest 5-10 SEO-friendly keywords
    - Suggest a meta description under 160 characters
    ${targetKeyword ? `-Primary keyword: "${targetKeyword}"`: ""}

    Article:
    ${content}
    `.trim();
}