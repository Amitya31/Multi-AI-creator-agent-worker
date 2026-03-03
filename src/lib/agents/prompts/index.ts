import { buildOutlinePrompt } from "./outline.js";
import { buildWriterPrompt } from "./writer.js";
import { buildSEOPrompt } from "./seo.js";
import { buildSummarizePrompt } from "./summarize.js";
import { buildTitlePrompt } from "./title.js";

export type AgentStepType = | "CREATE_OUTLINE" |  "GENERATE_TEXT" | "SEO_OPTIMIZE" | "GENERATE_TITLE" | "SUMMARIZE";

export type AgentPromptContext = {
    stepType: AgentStepType | string;  
    agentId:string;
    input:any;
    options?:any; 
};

export function buildAgentPrompt(ctx: AgentPromptContext): string{
    const {stepType, agentId, input, options} = ctx;

    switch(stepType) {
        case "CREATE_OUTLINE":
            return buildOutlinePrompt(input,options);
        case "GENERATE_TEXT":
            return buildWriterPrompt(input, options);
        case "SEO_OPTIMIZE":
            return buildSEOPrompt(input, options);
        case "GENERATE_TITLE":
            return buildTitlePrompt(input, options);
        case "SUMMARIZE":
            return buildSummarizePrompt(input, options);
        default:
            return (
                options?.promptOverride ??
                `
                You are ${agentId}.

                Perform the requested ioperation based on the input below.

                Input:
                ${typeof input === "string" ? input : JSON.stringify(input, null, 2)}
                `
                .trim()
            );
        
    }
}


