"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCourtroomStore } from "@/store/courtroomStore";
import { useUIStore } from "@/store/uiStore";
import SpeechBubble from "@/components/ui/SpeechBubble";
import { roleLabel, cn } from "@/lib/utils";
import type { AgentRole } from "@/types/trial.types";

interface Props {
  role: AgentRole;
  label?: string;
  providerInfo?: string; // e.g. "groq / llama-3.3-70b-versatile"
}

const roleAccent: Record<AgentRole, string> = {
  judge:      "border-court-judgeAcc/40",
  advocate_a: "border-court-prosecutionAcc/40",
  advocate_b: "border-court-defenseAcc/40",
  witness:    "border-court-witnessAcc/40",
};

const roleGlow: Record<AgentRole, string> = {
  judge:      "shadow-[0_0_24px_-4px_rgba(42,107,50,0.35)]",
  advocate_a: "shadow-[0_0_24px_-4px_rgba(42,78,138,0.35)]",
  advocate_b: "shadow-[0_0_24px_-4px_rgba(138,42,42,0.35)]",
  witness:    "shadow-[0_0_24px_-4px_rgba(74,86,128,0.25)]",
};

const roleIcon: Record<AgentRole, string> = {
  judge:      "fa-solid fa-gavel",
  advocate_a: "fa-solid fa-scale-unbalanced",
  advocate_b: "fa-solid fa-shield-halved",
  witness:    "fa-solid fa-person",
};

export default function AgentPanel({ role, label, providerInfo }: Props) {
  const entries = useCourtroomStore((s) =>
    Object.values(s.streamingEntries).filter((e) => e.role === role),
  );
  const activeSpeaker = useCourtroomStore((s) => s.activeSpeaker);
  const spotlight = useUIStore((s) => s.spotlightRole);

  const isActive = activeSpeaker?.role === role || spotlight === role;
  const latestEntry = entries[entries.length - 1];

  // Auto-scroll to bottom whenever content changes
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [latestEntry?.content]);

  return (
    <motion.div
      layout
      className={cn(
        "flex h-full flex-col rounded border bg-court-panel transition-all duration-300",
        isActive
          ? [roleAccent[role], roleGlow[role], "border-opacity-100"]
          : "border-court-border",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-court-border px-4 py-2">
        <i className={cn(roleIcon[role], "text-court-parchmentMuted text-xs")} />
        <span className="font-serif text-xs uppercase tracking-widest text-court-parchmentMuted">
          {label ?? roleLabel(role)}
        </span>

        {/* ── Info button ── */}
        {providerInfo && (
          <div className="relative ml-1 group">
            <button className="flex h-4 w-4 items-center justify-center rounded-full border border-court-border text-[9px] text-court-parchmentMuted/60 hover:border-court-gold/40 hover:text-court-gold transition-colors">
              i
            </button>
            {/* Tooltip */}
            <div className="pointer-events-none absolute left-1/2 top-6 z-50 -translate-x-1/2 whitespace-nowrap rounded border border-court-border bg-court-surface px-2 py-1 font-mono text-[10px] text-court-parchmentMuted opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {providerInfo}
            </div>
          </div>
        )}

        {isActive && latestEntry?.isStreaming && (
          <span className="ml-auto h-1.5 w-1.5 animate-phase-pulse rounded-full bg-court-gold" />
        )}
      </div>

      {/* Speech area — auto-scrolls */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-3 scrollbar-thin"
      >
        <AnimatePresence initial={false}>
          {entries.length === 0 && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-serif text-xs italic text-court-parchmentMuted/40 mt-auto text-center pb-4"
            >
              Awaiting counsel…
            </motion.p>
          )}
          {entries.map((entry) => (
            <motion.div
              key={entry.entryId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SpeechBubble
                role={role}
                content={entry.content}
                isStreaming={entry.isStreaming}
                isPaused={entry.isPaused}
                stricken={entry.stricken}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
