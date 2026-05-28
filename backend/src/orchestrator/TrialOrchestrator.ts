import { v4 as uuid } from "uuid";
import { Server as IOServer } from "socket.io";
import { prisma } from "../lib/db";
import { redis, TRIAL_PHASE_KEY } from "../lib/redis";
import { getProvider } from "../lib/ai";
import { buildSystemPrompt } from "../lib/prompts";
import type { CourtPhase, AgentRole, TrialConfig, CourtroomEvent } from "../lib/types";

const PHASE_ORDER: CourtPhase[] = [
  "INITIALIZED",
  "OPENING_PROSECUTION",
  "OPENING_DEFENSE",
  "EVIDENCE_SUBMISSION",
  "DIRECT_EXAMINATION",
  "CROSS_EXAMINATION",
  "CLOSING_PROSECUTION",
  "CLOSING_DEFENSE",
  "DELIBERATION",
  "VERDICT",
  "CONCLUDED",
];

const PHASE_SPEAKER: Partial<Record<CourtPhase, AgentRole>> = {
  OPENING_PROSECUTION:  "advocate_a",
  OPENING_DEFENSE:      "advocate_b",
  EVIDENCE_SUBMISSION:  "advocate_a",
  DIRECT_EXAMINATION:   "witness",
  CROSS_EXAMINATION:    "advocate_b",
  CLOSING_PROSECUTION:  "advocate_a",
  CLOSING_DEFENSE:      "advocate_b",
  DELIBERATION:         "judge",
  VERDICT:              "judge",
};

// ~40ms per token = comfortable reading speed (~25 tokens/sec)
const TOKEN_DELAY_MS = 40;

export class TrialOrchestrator {
  private io: IOServer;
  private trialId: string;
  private config: TrialConfig;
  private currentPhase: CourtPhase = "INITIALIZED";
  private running = false;

  constructor(io: IOServer, trialId: string, config: TrialConfig) {
    this.io = io;
    this.trialId = trialId;
    this.config = config;
  }

  private emit(event: Omit<CourtroomEvent, "trialId" | "timestamp">) {
    const full = { ...event, trialId: this.trialId, timestamp: new Date().toISOString() } as CourtroomEvent;
    this.io.to(this.trialId).emit("courtroom_event", full);
  }

  private async getRecentTranscript(limit = 6): Promise<string> {
    const entries = await prisma.transcriptEntry.findMany({
      where: { trialId: this.trialId },
      orderBy: { sequence: "desc" },
      take: limit,
    });
    return entries.reverse().map((e) => `[${e.role.toUpperCase()}]: ${e.content}`).join("\n");
  }

  private async getEvidenceSummary(): Promise<string> {
    const ev = await prisma.evidence.findMany({ where: { trialId: this.trialId, status: "admitted" } });
    return ev.map((e) => `• ${e.title}: ${e.content.slice(0, 80)}`).join("\n");
  }

  private getAssignment(role: AgentRole) {
    const a = this.config.agentAssignments.find((x) => x.role === role);
    if (!a) throw new Error(`No assignment for role: ${role}`);
    return a;
  }

  private detectObjection(text: string): string | null {
    const match = text.match(/objection[\s—–-]+([^.!?\n]{3,60})/i);
    return match ? match[1].trim() : null;
  }

  private async runAgentTurn(
    role: AgentRole,
    entryId: string,
    trial: { title: string; caseDescription: string | null },
  ): Promise<string> {
    const assignment = this.getAssignment(role);

    // Full error log with provider + model info
    let provider;
    try {
      provider = getProvider(assignment.provider as never);
    } catch (e) {
      throw new Error(`[${role}] Unknown provider "${assignment.provider}": ${String(e)}`);
    }

    const recentTranscript = await this.getRecentTranscript();
    const evidenceSummary  = await this.getEvidenceSummary();
    const systemPrompt = buildSystemPrompt(role, {
      trialTitle: trial.title,
      caseDescription: trial.caseDescription ?? "",
      phase: this.currentPhase,
      rules: this.config.rules,
      recentTranscript,
      evidenceSummary,
    });

    this.emit({ type: "STREAM_START", agentId: role, role, entryId });

    let fullText = "";
    let tokenCount = 0;

    try {
      const full = await provider.streamCompletion({
        model: assignment.model,
        systemPrompt,
        temperature: assignment.temperature ?? 0.75,
        maxTokens: 600,
        messages: [{ role: "user", content: `Proceed with your ${this.currentPhase} statement.` }],
        onToken: async (token) => {
          fullText += token;
          tokenCount++;
          this.emit({ type: "TOKEN", agentId: role, role, token, entryId });
          await this.sleep(TOKEN_DELAY_MS);
        },
      });

      this.emit({ type: "STREAM_END", agentId: role, role, entryId, tokenCount });

      const sequence = await prisma.transcriptEntry.count({ where: { trialId: this.trialId } });
      await prisma.transcriptEntry.create({
        data: { id: entryId, trialId: this.trialId, participantId: role, role, phase: this.currentPhase, content: full, tokenCount, sequence },
      });

      await this.maybeRaiseObjection(role, entryId, full);
      return full;
    } catch (e: unknown) {
      // Emit the FULL error so frontend can display it clearly
      const errMsg = `[${role}] Provider: ${assignment.provider}, Model: ${assignment.model} — ${String(e)}`;
      this.emit({ type: "STREAM_END", agentId: role, role, entryId, tokenCount: 0 });
      throw new Error(errMsg);
    }
  }

  private async maybeRaiseObjection(speakerRole: AgentRole, targetEntryId: string, text: string) {
    const grounds = this.detectObjection(text);
    if (!grounds || speakerRole === "judge") return;

    const objectorRole: AgentRole = speakerRole === "advocate_a" ? "advocate_b" : "advocate_a";
    const objectionId = uuid();

    this.emit({ type: "OBJECTION_RAISED", objectionId, raisedBy: objectorRole, grounds, targetEntryId });

    const objSeq = await prisma.objection.count({ where: { trialId: this.trialId } });
    await prisma.objection.create({
      data: { id: objectionId, trialId: this.trialId, raisedBy: objectorRole, grounds, targetEntryId, sequence: objSeq },
    });

    const judgeAssignment = this.getAssignment("judge");
    const judgeProvider = getProvider(judgeAssignment.provider as never);
    const rulingText = await judgeProvider.streamCompletion({
      model: judgeAssignment.model,
      systemPrompt: `You are the presiding judge. Rule on this objection: "${grounds}". Reply ONLY: "Objection sustained." or "Objection overruled." followed by one sentence reason.`,
      messages: [{ role: "user", content: "Rule now." }],
      temperature: 0.3,
      maxTokens: 80,
      onToken: async (t) => {
        this.emit({ type: "TOKEN", agentId: "judge", role: "judge", token: t, entryId: objectionId + "_ruling" });
        await this.sleep(TOKEN_DELAY_MS);
      },
    });

    const ruling: "sustained" | "overruled" = rulingText.toLowerCase().includes("sustained") ? "sustained" : "overruled";
    await prisma.objection.update({ where: { id: objectionId }, data: { ruling } });
    this.emit({ type: "OBJECTION_RESOLVED", objectionId, ruling, strickenEntryId: ruling === "sustained" ? targetEntryId : undefined });
    if (ruling === "sustained") {
      await prisma.transcriptEntry.update({ where: { id: targetEntryId }, data: { stricken: true } });
    }
  }

  private async issueVerdict(trial: { title: string; caseDescription: string | null }) {
    const judgeAssignment = this.getAssignment("judge");
    const judgeProvider = getProvider(judgeAssignment.provider as never);
    const transcript = await this.getRecentTranscript(20);
    const evidence = await this.getEvidenceSummary();

    const verdictText = await judgeProvider.streamCompletion({
      model: judgeAssignment.model,
      systemPrompt: `You are the judge. Deliver a verdict JSON: {"outcome":"[Guilty|Not Guilty|Dismissed]","reasoning":"[2-3 sentences]"}. Respond ONLY with valid JSON.`,
      messages: [{ role: "user", content: `Transcript:\n${transcript}\n\nEvidence:\n${evidence}\n\nDeliver verdict.` }],
      temperature: 0.4,
      maxTokens: 300,
      onToken: () => {},
    });

    let outcome = "Not Guilty";
    let reasoning = "Insufficient evidence presented.";
    try {
      const parsed = JSON.parse(verdictText.replace(/```json|```/g, "").trim());
      outcome = parsed.outcome ?? outcome;
      reasoning = parsed.reasoning ?? reasoning;
    } catch { /* use defaults */ }

    const verdict = await prisma.verdict.create({ data: { trialId: this.trialId, outcome, reasoning } });
    this.emit({ type: "VERDICT_ISSUED", verdict });
  }

  async run() {
    if (this.running) return;
    this.running = true;

    await prisma.trial.update({ where: { id: this.trialId }, data: { status: "active", concludedAt: null } });
    const trial = await prisma.trial.findUniqueOrThrow({ where: { id: this.trialId } });

    for (const phase of PHASE_ORDER) {
      const previousPhase = this.currentPhase;
      this.currentPhase = phase;
      await redis.set(TRIAL_PHASE_KEY(this.trialId), phase);
      this.emit({ type: "PHASE_CHANGE", phase, previousPhase });
      await this.sleep(800);

      if (phase === "CONCLUDED") break;
      if (phase === "INITIALIZED") { await this.sleep(800); continue; }

      const speakerRole = PHASE_SPEAKER[phase];
      if (!speakerRole) continue;

      const entryId = uuid();
      this.emit({ type: "SPEAKER_CHANGE", agentId: speakerRole, role: speakerRole });
      await this.sleep(400);

      try {
        await this.runAgentTurn(speakerRole, entryId, trial);
      } catch (err) {
        const fullError = String(err);
        console.error(`[orchestrator] ${fullError}`);
        this.emit({ type: "PROCEDURAL_NOTICE", message: `Error during ${phase}: ${fullError}`, severity: "error" });
      }

      if (phase === "VERDICT") { await this.issueVerdict(trial); break; }
      await this.sleep(1200);
    }

    await prisma.trial.update({ where: { id: this.trialId }, data: { status: "concluded", concludedAt: new Date() } });
    this.emit({ type: "TRIAL_CONCLUDED" });
    this.running = false;
  }

  private sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
}
