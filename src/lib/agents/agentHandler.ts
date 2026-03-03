// lib/agents/agentHandler.ts
import { runGroqAgent } from "../llm/groq.js";
import { runGeminiAgent } from "../llm/gemini.js";

export async function runAgent(
  agentId: string,
  input: any,
  options?: any
):
Promise<{
  text: string;
  model: string;
  usage: {
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
  } | null;

}> {
  const prompt =  typeof input === "string" ? input : JSON.stringify(input, null, 2);

  const provider = process.env.LLM_PROVIDER ?? "groq";

  if (provider === "groq") {
    return runGroqAgent(agentId, prompt, options);
  }

  if (provider === "gemini") {
    return runGeminiAgent(agentId, prompt, options);
  }

  throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
}
