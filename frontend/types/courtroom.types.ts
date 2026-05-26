import type { CourtPhase, AgentRole, Evidence, Objection, Verdict } from "./trial.types";

export interface ActiveSpeaker {
  agentId: string;
  role: AgentRole;
  entryId: string;
  startedAt: string;
}

export interface StreamingEntry {
  entryId: string;
  role: AgentRole;
  content: string;
  isStreaming: boolean;
  isPaused: boolean;
  stricken: boolean;
}

export interface CourtroomState {
  trialId: string | null;
  phase: CourtPhase;
  activeSpeaker: ActiveSpeaker | null;
  streamingEntries: Record<string, StreamingEntry>;
  pendingObjection: Objection | null;
  admittedEvidence: Evidence[];
  verdictData: Verdict | null;
  isConnected: boolean;
  elapsedSeconds: number;
}

export interface UIState {
  showObjectionBanner: boolean;
  objectionBannerData: {
    grounds: string;
    raisedBy: AgentRole;
    ruling?: "sustained" | "overruled";
  } | null;
  showVerdictModal: boolean;
  spotlightRole: AgentRole | null;
  proceduralNotices: Array<{ id: string; message: string; severity: string }>;
}
