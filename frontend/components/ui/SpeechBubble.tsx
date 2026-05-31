"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { AgentRole } from "@/types/trial.types";

interface Props {
  role: AgentRole;
  content: string;       // full text received so far from store
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

// 3 words/sec → average word is ~5 chars + 1 space = 6 chars
// interval per char = 1000ms / (3 words * 6 chars) ≈ 55ms per char
const MS_PER_CHAR = 55;

export default function SpeechBubble({ role, content, isStreaming, isPaused, stricken }: Props) {
  // displayed is what's actually shown — lags behind content intentionally
  const [displayed, setDisplayed] = useState("");
  const queueRef = useRef("");      // unrendered chars waiting to be shown
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When new content arrives from store, add the diff to the queue
  useEffect(() => {
    const newChars = content.slice(queueRef.current.length + displayed.length);
    if (newChars) {
      queueRef.current += newChars;
    }
  }, [content, displayed.length]);

  // Drain the queue one char at a time at MS_PER_CHAR rate
  useEffect(() => {
    function tick() {
      if (queueRef.current.length === 0) {
        timerRef.current = null;
        return;
      }
      // Release one character at a time for smooth typewriter feel
      const char = queueRef.current[0];
      queueRef.current = queueRef.current.slice(1);
      setDisplayed((d) => d + char);
      timerRef.current = setTimeout(tick, MS_PER_CHAR);
    }

    if (!timerRef.current && queueRef.current.length > 0) {
      timerRef.current = setTimeout(tick, MS_PER_CHAR);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [displayed]); // re-check queue every time displayed updates

  // When streaming ends, flush remaining queue instantly so nothing is lost
  useEffect(() => {
    if (!isStreaming && queueRef.current.length > 0) {
      setDisplayed((d) => d + queueRef.current);
      queueRef.current = "";
    }
  }, [isStreaming]);

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

      {/* Blinking cursor while typing */}
      {isStreaming && !isPaused && (
        <span
          className={cn(
            "ml-[2px] inline-block h-[1em] w-[2px] translate-y-[1px] animate-cursor-blink",
            cursorColors[role],
          )}
        />
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
