"use client";
import { useElapsed } from "@/hooks/useElapsed";
import { useCourtroomStore } from "@/store/courtroomStore";
import { formatElapsed } from "@/lib/utils";
import AgentPanel from "./AgentPanel";
import EvidenceRail from "./EvidenceRail";
import TranscriptRail from "./TranscriptRail";
import PhaseTag from "@/components/ui/PhaseTag";
import ObjectionBanner from "@/components/ui/ObjectionBanner";
import VerdictModal from "@/components/ui/VerdictModal";
import ProceduralNotices from "@/components/ui/ProceduralNotices";
import { cn } from "@/lib/utils";

export default function CourtroomLayout({ trialTitle }: { trialTitle: string }) {
  useElapsed();
  const phase = useCourtroomStore((s) => s.phase);
  const elapsed = useCourtroomStore((s) => s.elapsedSeconds);
  const isConnected = useCourtroomStore((s) => s.isConnected);

  return (
    <div className="flex h-screen flex-col bg-court-bg text-court-parchment overflow-hidden">
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between border-b border-court-border bg-court-surface px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-landmark text-court-gold text-sm" />
          <span className="font-serif text-sm tracking-widest uppercase text-court-parchmentDim">
            {trialTitle}
          </span>
        </div>
        <PhaseTag phase={phase} />
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-court-parchmentMuted tabular-nums">
            {formatElapsed(elapsed)}
          </span>
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs",
              isConnected ? "text-court-judgeAcc" : "text-red-500/70",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isConnected ? "bg-court-judgeAcc animate-phase-pulse" : "bg-red-500/70",
              )}
            />
            {isConnected ? "Live" : "Disconnected"}
          </span>
        </div>
      </header>

      {/* ── Main Grid ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left rail: transcript */}
        <aside className="hidden w-64 shrink-0 border-r border-court-border xl:flex xl:flex-col">
          <TranscriptRail />
        </aside>

        {/* Centre: agent panels */}
        <main className="flex flex-1 flex-col gap-0 overflow-hidden">
          {/* Judge bench — top */}
          <div className="h-[30%] border-b border-court-border p-3 shrink-0">
            <AgentPanel role="judge" label="Presiding Judge" />
          </div>

          {/* Advocates row */}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 border-r border-court-border p-3">
              <AgentPanel role="advocate_a" label="Prosecution" />
            </div>
            <div className="flex-1 p-3">
              <AgentPanel role="advocate_b" label="Defence" />
            </div>
          </div>

          {/* Witness — collapsible bottom strip */}
          {(phase === "DIRECT_EXAMINATION" || phase === "CROSS_EXAMINATION" || phase === "REDIRECT") && (
            <div className="h-[22%] shrink-0 border-t border-court-border p-3">
              <AgentPanel role="witness" label="Witness Stand" />
            </div>
          )}
        </main>

        {/* Right rail: evidence */}
        <aside className="hidden w-64 shrink-0 border-l border-court-border lg:flex lg:flex-col">
          <EvidenceRail />
        </aside>
      </div>

      {/* Overlays */}
      <ObjectionBanner />
      <VerdictModal />
      <ProceduralNotices />
    </div>
  );
}
