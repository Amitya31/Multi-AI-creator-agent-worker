export function buildWriterPrompt(input: any, options?:any):string{
    const tone  = options?.tone ?? "string";
    const style = options?.style ?? "blog";

    const outline = typeof input==="string" ? input : input?.outline ?? JSON.stringify(input, null ,2);

    return `
    You are a professional ${style} writer.

    Write a well-structured article based on the outline below.

    Requirements:
    - Tone: ${tone}
    - Use headings and subheadings
    - Smooth transitions between sections
    - Concrete examples where helpful
    - No bullet-only output; full paragraphs

    Outline:
    ${outline}
    `.trim();
}