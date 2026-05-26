export type TrialStatus = "idle" | "active" | "concluded";

export type CourtPhase =
  | "IDLE"
  | "INITIALIZED"
  | "OPENING_PROSECUTION"
  | "OPENING_DEFENSE"
  | "EVIDENCE_SUBMISSION"
  | "WITNESS_SCHEDULING"
  | "DIRECT_EXAMINATION"
  | "CROSS_EXAMINATION"
  | "REDIRECT"
  | "OBJECTION_PENDING"
  | "CLOSING_PROSECUTION"
  | "CLOSING_DEFENSE"
  | "DELIBERATION"
  | "VERDICT"
  | "CONCLUDED";

export type AgentRole = "judge" | "advocate_a" | "advocate_b" | "witness";
export type AIProvider = "groq" | "cerebras" | "gemini" | "openrouter" | "anthropic" | "ollama";

export interface AgentAssignment {
  role: AgentRole;
  provider: AIProvider;
  model: string;
  temperature?: number;
}

export interface PhaseTimeouts {
  opening: number;
  evidence: number;
  examination: number;
  closing: number;
  deliberation: number;
}

export interface TrialConfig {
  phaseOrder?: CourtPhase[];
  rules: "federal" | "simplified";
  agentAssignments: AgentAssignment[];
  timeouts?: Partial<PhaseTimeouts>;
}

export interface Trial {
  id: string;
  title: string;
  caseDescription?: string;
  status: TrialStatus;
  config: TrialConfig;
  createdAt: string;
  concludedAt?: string;
}

export interface Evidence {
  id: string;
  trialId: string;
  submittedBy: string;
  title: string;
  content: string;
  fileUrl?: string;
  status: "pending" | "admitted" | "excluded";
  rulingReason?: string;
}

export interface TranscriptEntry {
  id: string;
  trialId: string;
  participantId: string;
  role: AgentRole;
  phase: CourtPhase;
  content: string;
  stricken: boolean;
  tokenCount: number;
  sequence: number;
  createdAt: string;
}

export interface Objection {
  id: string;
  trialId: string;
  raisedBy: AgentRole;
  grounds: string;
  ruling?: "sustained" | "overruled";
  targetEntryId?: string;
  sequence: number;
}

export interface Verdict {
  id: string;
  trialId: string;
  outcome: string;
  reasoning: string;
  evidenceWeights?: Record<string, number>;
  createdAt: string;
}
