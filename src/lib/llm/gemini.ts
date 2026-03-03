// lib/llm/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NormalizedUsage } from "./types.js";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function runGeminiAgent(
  agentId: string,
  prompt: string,
  options?: any
) {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY missing");
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `You are ${agentId}.\n\n${prompt}` }],
      },
    ],
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxTokens ?? 2048,
    },
  });

  const u = result.response.usageMetadata;

  const usage: NormalizedUsage | null = u
    ? {
        promptTokens: u.promptTokenCount ?? null,
        completionTokens: u.candidatesTokenCount ?? null,
        totalTokens: u.totalTokenCount ?? null,
      }
    : null

  return {
    text: result.response.text(),
    usage,
    model: modelName,
  };
}
