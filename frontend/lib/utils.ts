import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AgentRole, CourtPhase } from "@/types/trial.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function roleLabel(role: AgentRole): string {
  const map: Record<AgentRole, string> = {
    judge: "The Honourable Court",
    advocate_a: "Prosecution",
    advocate_b: "Defence",
    witness: "Witness",
  };
  return map[role];
}

export function phaseLabel(phase: CourtPhase): string {
  const map: Record<CourtPhase, string> = {
    IDLE: "Awaiting Session",
    INITIALIZED: "Court Convened",
    OPENING_PROSECUTION: "Opening — Prosecution",
    OPENING_DEFENSE: "Opening — Defence",
    EVIDENCE_SUBMISSION: "Evidence Submission",
    WITNESS_SCHEDULING: "Witness Scheduling",
    DIRECT_EXAMINATION: "Direct Examination",
    CROSS_EXAMINATION: "Cross-Examination",
    REDIRECT: "Redirect Examination",
    OBJECTION_PENDING: "Objection Pending",
    CLOSING_PROSECUTION: "Closing — Prosecution",
    CLOSING_DEFENSE: "Closing — Defence",
    DELIBERATION: "Jury Deliberation",
    VERDICT: "Verdict",
    CONCLUDED: "Proceedings Concluded",
  };
  return map[phase] ?? phase;
}
