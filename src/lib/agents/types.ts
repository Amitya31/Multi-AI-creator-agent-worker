// lib/agents/types.ts

export type AgentKey =
  | "outline"
  | "writer"
  | "seo"
  | "title"
  | "summarizer";

export type AgentStepType =
  | "CREATE_OUTLINE"
  | "GENERATE_TEXT"
  | "SEO_OPTIMIZE"
  | "GENERATE_TITLE"
  | "SUMMARIZE";

export type AgentPipelineStep = {
  key: AgentKey;
  type: AgentStepType;
  description?: string;
  options?: Record<string, any>;
};

export type ResolvedPipelineStep = {
  key: AgentKey;
  type: AgentStepType;
  agentId: string;
  options?: Record<string, any>;
};

