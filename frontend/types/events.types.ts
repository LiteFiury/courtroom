import type {
  CourtPhase,
  AgentRole,
  Evidence,
  Objection,
  Verdict,
} from "./trial.types";

export type CourtroomEventType =
  | "TRIAL_INITIALIZED"
  | "TRIAL_STARTED"
  | "TRIAL_CONCLUDED"
  | "PHASE_CHANGE"
  | "SPEAKER_CHANGE"
  | "STREAM_START"
  | "TOKEN"
  | "STREAM_END"
  | "OBJECTION_RAISED"
  | "OBJECTION_RESOLVED"
  | "EVIDENCE_ADMITTED"
  | "EVIDENCE_EXCLUDED"
  | "VERDICT_ISSUED"
  | "PROCEDURAL_NOTICE"
  | "ERROR";

interface BaseEvent {
  type: CourtroomEventType;
  trialId: string;
  timestamp: string;
}

export interface TrialConcludedEvent extends BaseEvent {
  type: "TRIAL_CONCLUDED";
}

export interface PhaseChangeEvent extends BaseEvent {
  type: "PHASE_CHANGE";
  phase: CourtPhase;
  previousPhase: CourtPhase;
}

export interface SpeakerChangeEvent extends BaseEvent {
  type: "SPEAKER_CHANGE";
  agentId: string;
  role: AgentRole;
}

export interface StreamStartEvent extends BaseEvent {
  type: "STREAM_START";
  agentId: string;
  role: AgentRole;
  entryId: string;
}

export interface TokenEvent extends BaseEvent {
  type: "TOKEN";
  agentId: string;
  role: AgentRole;
  token: string;
  entryId: string;
}

export interface StreamEndEvent extends BaseEvent {
  type: "STREAM_END";
  agentId: string;
  role: AgentRole;
  entryId: string;
  tokenCount: number;
}

export interface ObjectionRaisedEvent extends BaseEvent {
  type: "OBJECTION_RAISED";
  objectionId: string;
  raisedBy: AgentRole;
  grounds: string;
  targetEntryId: string;
}

export interface ObjectionResolvedEvent extends BaseEvent {
  type: "OBJECTION_RESOLVED";
  objectionId: string;
  ruling: "sustained" | "overruled";
  strickenEntryId?: string;
}

export interface EvidenceAdmittedEvent extends BaseEvent {
  type: "EVIDENCE_ADMITTED";
  evidence: Evidence;
}

export interface EvidenceExcludedEvent extends BaseEvent {
  type: "EVIDENCE_EXCLUDED";
  evidence: Evidence;
}

export interface VerdictIssuedEvent extends BaseEvent {
  type: "VERDICT_ISSUED";
  verdict: Verdict;
}

export interface ProceduralNoticeEvent extends BaseEvent {
  type: "PROCEDURAL_NOTICE";
  message: string;
  severity: "info" | "warning" | "error";
}

export type CourtroomEvent =
  | TrialConcludedEvent
  | PhaseChangeEvent
  | SpeakerChangeEvent
  | StreamStartEvent
  | TokenEvent
  | StreamEndEvent
  | ObjectionRaisedEvent
  | ObjectionResolvedEvent
  | EvidenceAdmittedEvent
  | EvidenceExcludedEvent
  | VerdictIssuedEvent
  | ProceduralNoticeEvent;
