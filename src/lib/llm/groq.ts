// lib/llm/groq.ts
import Groq from "groq-sdk";
import { type NormalizedUsage } from "./types.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function runGroqAgent(
  agentId: string,
  prompt: string,
  options?: any
) {
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `You are ${agentId}. Follow your role strictly.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
  });

  const raw = completion.usage;

  const usage: NormalizedUsage | null = raw
    ? {
        promptTokens: raw.prompt_tokens ?? null,
        completionTokens: raw.completion_tokens ?? null,
        totalTokens: raw.total_tokens ?? null,
      } : null;


  return {
    text: completion.choices[0]?.message?.content ?? "",
    usage,
    model,
  };
}
