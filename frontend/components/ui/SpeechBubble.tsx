"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { AgentRole } from "@/types/trial.types";

interface Props {
  role: AgentRole;
  content: string;
  isStreaming: boolean;
  isPaused: boolean;
  stricken: boolean;
}

const roleStyles: Record<AgentRole, string> = {
  judge:      "border-court-judgeBdr bg-court-judgeBg text-court-parchment",
  advocate_a: "border-court-prosecutionBdr bg-court-prosecutionBg text-court-parchment",
  advocate_b: "border-court-defenseBdr bg-court-defenseBg text-court-parchment",
  witness:    "border-court-witnessBdr bg-court-witnessBg text-court-parchmentDim",
};

const cursorColors: Record<AgentRole, string> = {
  judge:      "bg-court-judgeAcc",
  advocate_a: "bg-court-prosecutionAcc",
  advocate_b: "bg-court-defenseAcc",
  witness:    "bg-court-witnessAcc",
};

const MS_PER_CHAR = 55; // ~3 words/sec

export default function SpeechBubble({ role, content, isStreaming, isPaused, stricken }: Props) {
  const contentRef = useRef(content);
  contentRef.current = content;

  // Was this entry actively streaming when it first mounted?
  const wasStreamingOnMount = useRef(isStreaming);

  // If NOT streaming on mount = old/completed entry → show full text immediately, no animation
  const [displayed, setDisplayed] = useState(() =>
    isStreaming ? "" : content
  );
  const indexRef = useRef(isStreaming ? 0 : content.length);

  useEffect(() => {
    // Only run typewriter for entries that were streaming when they mounted
    if (!wasStreamingOnMount.current) return;

    const id = setInterval(() => {
      if (indexRef.current < contentRef.current.length) {
        indexRef.current += 1;
        setDisplayed(contentRef.current.slice(0, indexRef.current));
      }
    }, MS_PER_CHAR);

    return () => clearInterval(id);
  }, []); // run once on mount only

  return (
    <div
      className={cn(
        "relative rounded border px-4 py-3 font-serif text-sm leading-relaxed tracking-wide transition-all duration-200",
        roleStyles[role],
        stricken && "opacity-30 line-through",
        isPaused && "opacity-60",
      )}
    >
      <span>{displayed}</span>

      {/* Cursor only shows while this entry is actively being typed */}
      {isStreaming && !isPaused && wasStreamingOnMount.current && (
        <span className={cn(
          "ml-[2px] inline-block h-[1em] w-[2px] translate-y-[1px] animate-cursor-blink",
          cursorColors[role],
        )} />
      )}

      {isPaused && isStreaming && (
        <span className="ml-1 animate-cursor-blink text-court-gold text-xs">▌</span>
      )}

      {stricken && (
        <span className="absolute right-2 top-1 text-[10px] uppercase tracking-widest text-red-400 opacity-70">
          stricken
        </span>
      )}
    </div>
  );
}
