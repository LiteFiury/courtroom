export type CourtPhase =
  | "IDLE" | "INITIALIZED"
  | "OPENING_PROSECUTION" | "OPENING_DEFENSE"
  | "EVIDENCE_SUBMISSION" | "WITNESS_SCHEDULING"
  | "DIRECT_EXAMINATION" | "CROSS_EXAMINATION" | "REDIRECT"
  | "OBJECTION_PENDING"
  | "CLOSING_PROSECUTION" | "CLOSING_DEFENSE"
  | "DELIBERATION" | "VERDICT" | "CONCLUDED";

export type AgentRole = "judge" | "advocate_a" | "advocate_b" | "witness";
export type AIProvider = "groq" | "anthropic" | "openrouter" | "ollama" | "gemini" | "cerebras";

export interface AgentAssignment {
  role: AgentRole;
  provider: AIProvider;
  model: string;
  temperature?: number;
}

export interface TrialConfig {
  rules: "federal" | "simplified";
  agentAssignments: AgentAssignment[];
}

export interface CourtroomEvent {
  type: string;
  trialId: string;
  timestamp: string;
  [key: string]: unknown;
}
